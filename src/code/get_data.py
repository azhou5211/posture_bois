import torch
import torchvision
ucf_data = torchvision.datasets.UCF101(root="https://www.crcv.ucf.edu/THUMOS14/UCF101/UCF101/",annotation_path,frames_per_clip,step_between_clips=1, frame_rate=None,fold=1,train=True,transform=None,_precomputed_metadata=None, num_workers=1,_video_width=0,_video_height=0,_video_min_dimension=0, _audio_samples=0)
data_loader = torch.utils.data.DataLoader(ucf_data,
                                          batch_size=4,
                                          shuffle=True,
                                          num_workers=args.nThreads)
                                          
print(data_loader)