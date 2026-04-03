import React from 'react';
import {Composition} from 'remotion';
import {SlideshowVideo} from './compositions/Slideshow';
import {WallOfTextVideo} from './compositions/WallOfText';
import {VideoHookVideo} from './compositions/VideoHook';
import {GreenScreenMemeVideo} from './compositions/GreenScreenMeme';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Slideshow"
        component={SlideshowVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          compositionDoc: null,
          slides: [{title: 'Slide 1', body: 'Body text'}],
          brandName: '',
          brandColor: '#6C3CE1',
        }}
        calculateMetadata={({props}) => {
          if (props.compositionDoc?.timing?.totalFrames) {
            return {durationInFrames: props.compositionDoc.timing.totalFrames};
          }
          const slides = props.compositionDoc?.slides || props.slides || [];
          const slideCount = slides.length || 1;
          return {durationInFrames: slideCount * 105};
        }}
      />
      <Composition
        id="WallOfText"
        component={WallOfTextVideo}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          compositionDoc: null,
          text: 'Your wall of text goes here.',
          brandName: '',
        }}
        calculateMetadata={({props}) => {
          if (props.compositionDoc?.timing?.totalFrames) {
            return {durationInFrames: props.compositionDoc.timing.totalFrames};
          }
          const text = props.compositionDoc?.text || props.text || '';
          const len = text.length;
          const secs = Math.max(8, Math.min(len / 15, 20));
          return {durationInFrames: Math.round(secs * 30)};
        }}
      />
      <Composition
        id="VideoHook"
        component={VideoHookVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          compositionDoc: null,
          hook: 'Wait for it...',
          body: '',
          brandName: '',
        }}
        calculateMetadata={({props}) => {
          if (props.compositionDoc?.timing?.totalFrames) {
            return {durationInFrames: props.compositionDoc.timing.totalFrames};
          }
          const body = props.compositionDoc?.body || props.body || '';
          const bodyLen = body.length;
          const bodySecs = Math.max(5, Math.min(bodyLen / 20, 12));
          return {durationInFrames: Math.round((3 + bodySecs) * 30)};
        }}
      />
      <Composition
        id="GreenScreenMeme"
        component={GreenScreenMemeVideo}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          compositionDoc: null,
          topText: 'TOP TEXT',
          bottomText: 'BOTTOM TEXT',
          brandName: '',
        }}
        calculateMetadata={({props}) => {
          if (props.compositionDoc?.timing?.totalFrames) {
            return {durationInFrames: props.compositionDoc.timing.totalFrames};
          }
          return {durationInFrames: 180};
        }}
      />
    </>
  );
};
