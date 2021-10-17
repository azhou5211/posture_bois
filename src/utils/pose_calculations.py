from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np


class PoseCalculations:
    # this is a class containing various functions to do with positioning
    def __init__(self, data=None) -> None:
        self.df = data
        self.normalized_df = None
        self.pca_model = None
        self.poses = None
        self.expanded_df = None

    # IN: filePath = path to csv file
    # OUT: DataFrame with rows as frames of video, columns multiindex by vector name and dimensions. Eg l_forearm -> x, y, z 
    def process_file(self):

        # raw_data = pd.read_csv(filePath).drop(columns = ['Unnamed: 0'])
        # raw_data = self.df.copy()

        # Parse strings
        # strToArr = lambda s: np.array(
        #     [float(k) for k in s.replace("(", "").replace(")", '').replace(" ", "").split(',')[0:3]])
        # self.parsed_data = raw_data.applymap(strToArr)
        # print("First Check", self.df)
        print("SELFF1:", self.df)

        strToArr = lambda s: np.array([float(k) for k in s[0:3]])
        self.df = self.df.applymap(strToArr)

        print("SELFFF2:", self.df)

        # Convert to vectors
        vectorDf = self.points_to_vectors()

        # print("VECTORRRR:",vectorDf)
        # Normalize
        self.normalized_df = self.normalize(vectorDf)
        return self.normalized_df

    # this functition calculates the vector between two adjacent points for every 'cut' of human
    # this function takes in our original landmark data (point data)    
    def points_to_vectors(self):

        vector_df = pd.DataFrame()

        # vector_df['time'] = self.parsed_data['time']

        # indicies are hardcoded based on adjacent points
        print("STUDENT :", self.df)
        # left side vectors
        vector_df['l_forearm'] = self.df.iloc[:, 15] - self.df.iloc[:, 13]
        vector_df['l_upperarm'] = self.df.iloc[:, 13] - self.df.iloc[:, 11]
        vector_df['l_flank'] = self.df.iloc[:, 11] - self.df.iloc[:, 23]
        vector_df['l_thigh'] = self.df.iloc[:, 23] - self.df.iloc[:, 25]
        vector_df['l_shin'] = self.df.iloc[:, 25] - self.df.iloc[:, 27]

        # right side vectors
        vector_df['r_forearm'] = self.df.iloc[:, 16] - self.df.iloc[:, 14]
        vector_df['r_upperarm'] = self.df.iloc[:, 14] - self.df.iloc[:, 12]
        vector_df['r_flank'] = self.df.iloc[:, 12] - self.df.iloc[:, 24]
        vector_df['r_thigh'] = self.df.iloc[:, 24] - self.df.iloc[:, 26]
        vector_df['r_shin'] = self.df.iloc[:, 26] - self.df.iloc[:, 28]

        # other cuts
        vector_df['hips'] = self.df.iloc[:, 24] - self.df.iloc[:, 23]
        vector_df['shoulders'] = self.df.iloc[:, 12] - self.df.iloc[:, 11]
        vector_df['nose_left'] = self.df.iloc[:, 0] - self.df.iloc[:, 11]
        vector_df['nose_right'] = self.df.iloc[:, 0] - self.df.iloc[:, 12]

        # Convert into multi_index
        result = []
        for x in vector_df.columns:
            newDf = pd.DataFrame(vector_df[x].to_list(), columns=[[x, x, x], ["x", "y", "z"]])
            result.append(newDf)

        return pd.concat(result, axis=1)

    # Normalized a vector dataframe
    # IN: Dataframe of vectors, with multi-indexed column
    # OUT: Dataframe in same format, but each vector is normalized. Default l2
    def normalize(self, df, scaler=Normalizer(norm='l2')):
        df_scaled = df.groupby(level=0, axis=1).apply(
            lambda x: pd.DataFrame(scaler.fit_transform(x), columns=x.columns, index=x.index))
        return df_scaled

    # IN: Normalized dataframe from trainer videos
    # OUT: Function that takes array, transforms and trims
    def trainer_pca_transformer(self, target_variance=0.9):
        pca = PCA()
        pca.fit(self.normalized_df)

        # Find threshold explained variance
        var = pca.explained_variance_ratio_
        cumulative_total = np.cumsum(var)
        n = min(np.where(cumulative_total >= target_variance)[0])

        # Package into func
        self.pca_model = lambda x: pca.transform([x])[:, :n]

    # function that compares two vectors using cosine similarity
    @staticmethod
    def cosine_sim(vec1, vec2):
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    # This function compares the goal pose(trainer's) to the students current pose
    @staticmethod
    def compare_poses(teacher_pose, student_pose, transform=None):
        if transform:
            teacher_pose = transform(teacher_pose)[0]
            student_pose = transform(student_pose)[0]

        return PoseCalculations.cosine_sim(teacher_pose, student_pose)

    # KNN for identifying trainer's important poses
    def extract_key_poses(self, frames_per_pose=10, min_frames=5):
        # if self.normalized_df is None:
        #     raise Exception("Must normalize data before extracting key poses")
        def expand_df(df):
            return pd.concat([
                pd.DataFrame(df[x].to_list())
                for x in df.columns
            ], axis=1)

        self.expanded_df = expand_df(self.df)

        n_temp = self.expanded_df.shape[0] // frames_per_pose
        # print("KJDBSKJBDS", n_temp)
        kmeans = KMeans(n_clusters=n_temp).fit(self.expanded_df)
        labels = np.array(kmeans.labels_)
        label_count = np.array([(labels == i).sum() for i in range(kmeans.n_clusters)])
        extracted_poses = kmeans.cluster_centers_[np.where(label_count > min_frames)]

        # Repackage in dataframe
        #############CHANGED THIS TO EXPANDED MUST CHECK AGAIN _________________!
        self.poses = pd.DataFrame(extracted_poses, columns=self.expanded_df.columns)


# if __name__ == '__main__':
#     df = pd.read_csv("landmark_frame_data.csv").drop(columns = ['Unnamed: 0'])
#     strToArr = lambda s: np.array(
#         [float(k) for k in s.replace("(", "").replace(")", '').replace(" ", "").split(',')[0:3]])
#     df = df.applymap(strToArr)
#     pc = PoseCalculations(df)
#     test_df = pc.process_file()
#     pca_transform = pc.trainer_pca_transformer()
#     key_poses = pc.extract_key_poses()
#
#     for i, pose in test_df.iterrows():
#         print(PoseCalculations.compare_poses(key_poses.iloc[0, :], pose, transform=pca_transform))
