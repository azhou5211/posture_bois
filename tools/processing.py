import pandas as pd
import numpy as np



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
from sklearn.preprocessing import Normalizer
def normalize(df, scaler=Normalizer(norm='l2')):
    df_scaled = df.groupby(level=0, axis=1).apply(lambda x : pd.DataFrame(scaler.fit_transform(x), columns=x.columns, index=x.index))
    return df_scaled

# IN: Normalized dataframe
# OUT: Function that takes array, transforms and trims
from sklearn.decomposition import PCA
def get_pca_transformer(df, target_variance = 0.9):
    pca = PCA()
    pca.fit(df)

    # Find threshold explained variance
    var = pca.explained_variance_ratio_
    cumulative_total = np.cumsum(var)
    n = min(np.where(cumulative_total >= target_variance)[0])

    # Package into func
    return lambda x: pca.transform([x])[:,:n]

def cosine_sim(vec1, vec2):
    return np.dot(vec1, vec2)/(np.linalg.norm(vec1)*np.linalg.norm(vec2))

def compare_poses(teacher_pose, student_pose, transform=None, sim = cosine_sim):  
    if transform:
        teacher_pose = transform(teacher_pose)[0]
        student_pose = transform(student_pose)[0]
        
    return sim(teacher_pose, student_pose)

# Example
if __name__ == "__main__":
    df = process_file('landmark_data_tennis.csv')
    pca_transform = get_pca_transformer(df)
    print(compare_poses(df.iloc[0,:], df.iloc[1,:], transform=pca_transform))
    print(compare_poses(df.iloc[0,:], df.iloc[-1,:], transform=pca_transform))