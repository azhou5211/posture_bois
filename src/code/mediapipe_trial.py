import cv2
import mediapipe as mp
import numpy as np
import pandas as pd

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# for lndmrk in mp_pose.PoseLandmark:
#     print(lndmrk)
# VIDEO FEED
cap = cv2.VideoCapture('tennis_serve.mp4')
landmarks_data = np.array([])

i = 0
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
                li = []
                for id, lm in enumerate(results.pose_landmarks.landmark):
                    # h, w, c = img.shape
                    li.append([lm.x, lm.y, lm.z, lm.visibility])
                landmarks_.append(li)
        
        # Render detections
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                        mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                        mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                        )               
        
            cv2.imshow('Mediapipe Feed', image)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            break

    print(landmarks_)
    print(landmarks_data)
    # df = pd.DataFrame(landmarks_data, columns=np.arange(33))
    # print(df)
    # pd.DataFrame(landmarks_data).to_csv("landmark_data_tennis.csv")
    cap.release()
    cv2.destroyAllWindows()

print(len(landmarks))
