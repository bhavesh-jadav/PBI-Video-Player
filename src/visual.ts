/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VideoPlayerVisualSettings, VideoPlayerSettings } from "./settings";
import { select, Selection, BaseType } from 'd3-selection';

export class VideoPlayerVisual implements IVisual {
    private target: HTMLElement;
    private videoPlayerVisualSettings: VideoPlayerVisualSettings;
    private videoPlayerRootElement: Selection<BaseType, any, any, any>
    private videoPlayerSettings: VideoPlayerSettings;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        this.videoPlayerVisualSettings = VideoPlayerVisual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.videoPlayerSettings = this.videoPlayerVisualSettings.videoPlayerSettings;
        
        let viewportHeight = options.viewport.height;
        let viewportWidth = options.viewport.width;

        try {

            let videoLinkUrl = "";

            if (this.videoPlayerSettings.videoLink) {
                videoLinkUrl = this.videoPlayerSettings.videoLink;
            } else {
                videoLinkUrl = options.dataViews[0].single.value as string;
            }

            if (this.videoPlayerRootElement) {
                select(".rootElement").remove();
            }

            this.videoPlayerRootElement = select(this.target).append("div")
                .classed("rootElement", true);

            let videoElement = this.videoPlayerRootElement.append("video")
                .attr("heigh", viewportHeight - 100)
                .attr("width", viewportWidth)
                .attr("controls", "")
                .attr("muted","")

            let videoSourceElement: any = videoElement.append("source")
                .attr("src", videoLinkUrl)
                .attr("type", "video/mp4")
                .attr("volume", 0);

            if (this.videoPlayerSettings.autoPlayVideo) {
                (videoElement.node() as any).autoplay = "autoplay";
            }

            if (this.videoPlayerSettings.loopVideo) {
                (videoElement.node() as any).loop = "loop";
            }

            if (this.videoPlayerSettings.muteVideo) {
                (videoElement.node() as any).muted = "muted";
            }

            videoElement.append("p")
                .text("Your browser does not support the video tag.");
            
            
        } catch (error) {
            console.log(error);
        }
        
    }

    private static parseSettings(dataView: DataView): VideoPlayerVisualSettings {
        return VideoPlayerVisualSettings.parse(dataView) as VideoPlayerVisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VideoPlayerVisualSettings.enumerateObjectInstances(this.videoPlayerVisualSettings || VideoPlayerVisualSettings.getDefault(), options);
    }
}