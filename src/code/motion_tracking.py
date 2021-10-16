import cv2
import mediapipe as mp
import time

if __name__ == '__main__':

    mpDraw = mp.solutions.drawing_utils
    mpPose = mp.solutions.pose
    pose = mpPose.Pose()

    cap = cv2.VideoCapture("video_data/1.mp4")

    pTime = 0
    arr = []
    while True:
        success, img = cap.read()
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(imgRGB)
        # Print the landmark
        # print(results.pose_landmarks)
        arr.append(results.pose_landmarks)

        # Draw the pose on the img
        if results.pose_landmarks:
            mpDraw.draw_landmarks(img, results.pose_landmarks, mpPose.POSE_CONNECTIONS)

        '''FPS display on the top left corner'''
        # cTime = time.time()
        # fps = 1 / (cTime - pTime)
        # pTime = cTime
        # cv2.putText(img, str(int(fps)), (70,50), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)
        ''''''

        # Display image
        cv2.imshow("Image", img)

        cv2.waitKey(1)
