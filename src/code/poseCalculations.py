from sklearn.decomposition import PCA
import pandas as pd
import numpy as np

class poseCalculations:
    # this is a class containing various functions to do with positioning

    def __init__(self) -> None:
        pass


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
        
        # returns our 'vector' data
        return vector_df 

    
    # this function takes each cut in our vector data frame and normalizes each value
    def normalize(vec_data):
        for k in range(vec_data.shape[1]):
            #print(k)
            #vec_data.iloc[:,k] = vec_data.iloc[:,k]/np.linalg.norm(vec_data.iloc[:,k])
            vec_data.iloc[:,k] = vec_data.iloc[:,k].apply(lambda x: x/np.linalg.norm(x))
        return vec_data


    # Expands our dataframe to prepare for PCA
    def expand_df(df):
        return pd.concat([
            pd.DataFrame(df[x].to_list())
            for x in df.columns
        ], axis=1)


    # PCA on normalized vectors to determine which columns are most important and should be weighted more for 
    # similarity calculation
    def similarity_rule(expanded_trainer_data, target_variance = 0.9, n_components = 15):
        #target_variance = 0.9
        pca = PCA(n_components=n_components)
        pca.fit(expanded_trainer_data)
        
        # Find threshold explained variance
        var = pca.explained_variance_ratio_
        cumulative_total = np.cumsum(var)
        n = min(np.where(cumulative_total >= target_variance)[0])
        
        return pca, n


    # This function measures the cosine similarity between two vectors (teacher_pose and student_pose)
    # Used in our comparison function to return a score
    def cosine_sim(vec1, vec2):
        return np.dot(vec1, vec2)/(np.linalg.norm(vec1)*np.linalg.norm(vec2))
    
    
    # This function allows us to compare the two poses and measure their similarity
    # We transform the vectors based on PCA that explains a certain percentage of the variance
    def compare_poses(teacher_pose, student_pose, pca=None, n_components=5, sim = cosine_sim):  
        teacher_expanded = teacher_pose.apply(pd.Series).stack().reset_index(drop=True).values.reshape(1,-1)
        student_expanded = student_pose.apply(pd.Series).stack().reset_index(drop=True).values.reshape(1,-1)

        if pca:
            teacher_expanded = pca.transform(teacher_expanded)[0][:n_components]
            student_expanded = pca.transform(student_expanded)[0][:n_components]
            
        return sim(teacher_expanded, student_expanded)