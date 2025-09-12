// com.sounditout.backend.weblayer.dto.YouTubeVideo.java
package com.sounditout.backend.weblayer.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YouTubeVideo {
    private String title;
    private String url;
    private String channelTitle;
    private String description;
    private String publishedAt;   // ISO string
    private String thumbnailUrl;  // default high-quality thumb
}
