using System;
using System.Runtime.Serialization;

namespace AppleMusicApi
{
    [Flags]
    public enum ResourceType
    {
        Artists,
        Albums,
        Songs,
        [EnumMember(Value = "music-videos")]
        MusicVideos
    }
}