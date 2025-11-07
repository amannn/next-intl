/* eslint-disable jsx-a11y/media-has-caption */
import clsx from 'clsx';
import {ComponentProps, useEffect, useRef, useState} from 'react';
import useIsMobile from '../hooks/useIsMobile';

export default function Video({
  className,
  ...props
}: Omit<ComponentProps<'video'>, 'controls'>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();

  function onTogglePlay() {
    setIsPlaying(!isPlaying);
  }

  function handleVideoEnd() {
    setIsPlaying(false);
  }

  function handleVideoPlay() {
    setIsPlaying(true);
  }

  function handleVideoPause() {
    setIsPlaying(false);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function handlePlayEvent() {
      handleVideoPlay();
    }

    function handlePauseEvent() {
      handleVideoPause();
    }

    function handleEndedEvent() {
      handleVideoEnd();
    }

    video.addEventListener('play', handlePlayEvent);
    video.addEventListener('pause', handlePauseEvent);
    video.addEventListener('ended', handleEndedEvent);

    return () => {
      video.removeEventListener('play', handlePlayEvent);
      video.removeEventListener('pause', handlePauseEvent);
      video.removeEventListener('ended', handleEndedEvent);
    };
  }, []);

  return (
    <div className={clsx('relative', className)}>
      <video
        ref={videoRef}
        className="w-full cursor-pointer rounded-lg shadow-lg"
        controls={isMobile}
        {...props}
      />
      {!isMobile && (
        <button
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className={clsx(
            'absolute inset-0 flex items-center justify-center rounded-lg bg-black/10 transition-all hover:bg-black/20',
            isPlaying
              ? 'transition-duration-500 opacity-0'
              : 'transition-duration-200 opacity-100'
          )}
          onClick={onTogglePlay}
          type="button"
        >
          <svg
            className="h-16 w-16 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}
