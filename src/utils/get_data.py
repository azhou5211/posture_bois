import cv2
import mediapipe as mp
import numpy as np
import pandas as pd

class LabelExtractor:
    def __init__(self, input_file_path, show_frames=False):
        self.input_file_path = input_file_path
        self.df = None
        self.flag_show_frame = show_frames

    def extract_landmarks(self):
        mp_drawing = mp.solutions.drawing_utils
        mp_pose = mp.solutions.pose

        cap = cv2.VideoCapture(self.input_file_path)
        landmarks_data = []

        ## setting up mediapipe instance
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            while cap.isOpened():
                ret, frame = cap.read()

                if frame is not None:        
                # Recolor image to RGB
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                
                    # Make detection
                    results = pose.process(image)

                # Recolor back to BGR
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


                    # Extract landmarks
                    if results.pose_landmarks:
                        landmarks = results.pose_landmarks.landmark
                        # print(landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x)
                        row = []
                        for id, lm in enumerate(results.pose_landmarks.landmark):
                            row.append((lm.x, lm.y, lm.z, lm.visibility))
                    landmarks_data.append(row)
                
                # Render detections
                    if self.flag_show_frame:
                        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                                    mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                                    mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                                    )               
                
                        cv2.imshow('Mediapipe Feed', image)

                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break

            #print(landmarks_data)
            self.df = pd.DataFrame(landmarks_data, columns=np.arange(33))
            cap.release()
            cv2.destroyAllWindows()

    def save_csv(self, file_path="landmark_frame_data.csv"):
        """
        Function to save csv
        :param file_path: filepath to save csv
        :return: None
        """
        self.df.to_csv(file_path, index=False)
