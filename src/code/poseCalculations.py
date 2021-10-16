from sklearn.decomposition import PCA
from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

class poseCalculations:
    # this is a class containing various functions to do with positioning

    def __init__(self) -> None:
        pass


# IN: filePath = path to csv file
# OUT: DataFrame with rows as frames of video, columns multiindex by vector name and dimensions. Eg l_forearm -> x, y, z 
def process_file(filePath):
    raw_data = pd.read_csv(filePath).drop(columns = ['Unnamed: 0'])

    # Parse strings
    strToArr = lambda s : np.array([float(k) for k in s.replace("(", "").replace(")",'').replace(" ", "").split(',')[0:3]])
    parsed_data = raw_data.applymap(strToArr)

    # Convert to vectors
    vectorDf = points_to_vectors(parsed_data)

    # NOrmalize
    return normalize(vectorDf)

# this functition calculates the vector between two adjacent points for every 'cut' of human
# this function takes in our original landmark data (point data)    
def points_to_vectors(pos_data):
    
    vector_df = pd.DataFrame()
    
    #vector_df['time'] = pos_data['time']
    
    # indicies are hardcoded based on adjacent points
    
    # left side vectors
    vector_df['l_forearm'] = pos_data.iloc[:,15] - pos_data.iloc[:,13]
    vector_df['l_upperarm'] = pos_data.iloc[:,13] - pos_data.iloc[:,11]
    vector_df['l_flank'] = pos_data.iloc[:,11] - pos_data.iloc[:,23]
    vector_df['l_thigh'] = pos_data.iloc[:,23] - pos_data.iloc[:,25]
    vector_df['l_shin'] = pos_data.iloc[:,25] - pos_data.iloc[:,27]
    
    # right side vectors
    vector_df['r_forearm'] = pos_data.iloc[:,16] - pos_data.iloc[:,14]
    vector_df['r_upperarm'] = pos_data.iloc[:,14] - pos_data.iloc[:,12]
    vector_df['r_flank'] = pos_data.iloc[:,12] - pos_data.iloc[:,24]
    vector_df['r_thigh'] = pos_data.iloc[:,24] - pos_data.iloc[:,26]
    vector_df['r_shin'] =pos_data.iloc[:,26] - pos_data.iloc[:,28]
    
    # other cuts
    vector_df['hips'] = pos_data.iloc[:,24] - pos_data.iloc[:,23]
    vector_df['shoulders'] = pos_data.iloc[:,12] - pos_data.iloc[:,11]
    vector_df['nose_left'] = pos_data.iloc[:,0] - pos_data.iloc[:,11]
    vector_df['nose_right'] = pos_data.iloc[:,0] - pos_data.iloc[:,12]
    
    # Convert into multi_index
    result = []
    for x in vector_df.columns:
        newDf = pd.DataFrame(vector_df[x].to_list(), columns=[[x,x,x],["x","y","z"]])
        result.append(newDf)
        
    return pd.concat(result, axis=1)


# Normalized a vector dataframe
# IN: Dataframe of vectors, with multi-indexed column
# OUT: Dataframe in same format, but each vector is normalized. Default l2

def normalize(df, scaler=Normalizer(norm='l2')):
    df_scaled = df.groupby(level=0, axis=1).apply(lambda x : pd.DataFrame(scaler.fit_transform(x), columns=x.columns, index=x.index))
    return df_scaled

# IN: Normalized dataframe from trainer videos
# OUT: Function that takes array, transforms and trims
def trainer_pca_transformer(df, target_variance = 0.9):
    pca = PCA()
    pca.fit(df)

    # Find threshold explained variance
    var = pca.explained_variance_ratio_
    cumulative_total = np.cumsum(var)
    n = min(np.where(cumulative_total >= target_variance)[0])

    # Package into func
    return lambda x: pca.transform([x])[:,:n]

# function that compares two vectors using cosine similarity
def cosine_sim(vec1, vec2):
    return np.dot(vec1, vec2)/(np.linalg.norm(vec1)*np.linalg.norm(vec2))

# This function compares the goal pose(trainer's) to the students current pose
def compare_poses(teacher_pose, student_pose, transform=None, sim = cosine_sim):  
    if transform:
        teacher_pose = transform(teacher_pose)[0]
        student_pose = transform(student_pose)[0]
        
    return sim(teacher_pose, student_pose)

# KNN for identifying important poses
from sklearn.cluster import KMeans
def extract_key_poses(pose_df, frames_per_pose=10, min_frames=5):
    kmeans = KMeans(n_clusters=len(pose_df) // frames_per_pose).fit(pose_df)
    labels = np.array(kmeans.labels_)
    label_count = np.array([(labels == i).sum() for i in range(kmeans.n_clusters)])
    extracted_poses = kmeans.cluster_centers_[np.where(label_count > min_frames)]

    # Repackage in dataframe
    return pd.DataFrame(extracted_poses, columns=pose_df.columns)
