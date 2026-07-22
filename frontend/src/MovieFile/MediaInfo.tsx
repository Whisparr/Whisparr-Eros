import React from 'react';
import MediaInfoData from 'typings/MediaInfo';
import getLanguageName from 'Utilities/String/getLanguageName';
import translate from 'Utilities/String/translate';
import { useSingleMovieFile } from './useMovieFile';

export function formatLanguages(languages: string | undefined) {
  if (!languages) {
    return null;
  }

  const splitLanguages = [...new Set(languages.split('/'))].map((l) => {
    const simpleLanguage = l.split('_')[0];

    if (simpleLanguage === 'und') {
      return translate('Unknown');
    }

    return getLanguageName(simpleLanguage);
  });

  if (splitLanguages.length > 3) {
    return (
      <span title={splitLanguages.join(', ')}>
        {splitLanguages.slice(0, 2).join(', ')}, {splitLanguages.length - 2}{' '}
        more
      </span>
    );
  }

  return <span>{splitLanguages.join(', ')}</span>;
}

export type MediaInfoType =
  'audio' | 'audioLanguages' | 'subtitles' | 'video' | 'videoDynamicRangeType';

interface MediaInfoDisplayProps {
  mediaInfo: MediaInfoData | undefined;
  type: MediaInfoType;
}

export function MediaInfoDisplay({
  mediaInfo,
  type,
}: Readonly<MediaInfoDisplayProps>) {
  if (!mediaInfo) {
    return null;
  }

  const {
    audioChannels,
    audioCodec,
    audioLanguages,
    subtitles,
    videoCodec,
    videoDynamicRangeType,
  } = mediaInfo;

  if (type === 'audio') {
    return (
      <span>
        {audioCodec ? audioCodec : ''}

        {audioCodec && audioChannels ? ' - ' : ''}

        {audioChannels ? audioChannels.toFixed(1) : ''}
      </span>
    );
  }

  if (type === 'audioLanguages') {
    return formatLanguages(audioLanguages);
  }

  if (type === 'subtitles') {
    return formatLanguages(subtitles);
  }

  if (type === 'video') {
    return <span>{videoCodec}</span>;
  }

  if (type === 'videoDynamicRangeType') {
    return <span>{videoDynamicRangeType}</span>;
  }

  return null;
}

interface MediaInfoProps {
  movieFileId: number;
  type: MediaInfoType;
}

// Fetching wrapper — use when only movieFileId is available (e.g. Calendar).
function MediaInfo({ movieFileId, type }: Readonly<MediaInfoProps>) {
  const { data: movieFile } = useSingleMovieFile(movieFileId);

  return <MediaInfoDisplay mediaInfo={movieFile?.mediaInfo} type={type} />;
}

export default MediaInfo;
