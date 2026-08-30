import React from 'react';
import Modal from 'Components/Modal/Modal';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import { sizes } from 'Helpers/Props';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import { GrabReleasePayload } from '../useReleases';
import OverrideMatchModalContent from './OverrideMatchModalContent';

interface OverrideMatchModalProps {
  isOpen: boolean;
  title: string;
  indexerId: number;
  guid: string;
  movieId?: number;
  languages: Language[];
  quality: QualityModel;
  protocol: DownloadProtocol;
  isGrabbing: boolean;
  grabError?: string;
  onGrabRelease(payload: GrabReleasePayload): void;
  onModalClose(): void;
}

function OverrideMatchModal(props: OverrideMatchModalProps) {
  const {
    isOpen,
    title,
    indexerId,
    guid,
    movieId,
    languages,
    quality,
    protocol,
    isGrabbing,
    grabError,
    onGrabRelease,
    onModalClose,
  } = props;

  return (
    <Modal isOpen={isOpen} size={sizes.LARGE} onModalClose={onModalClose}>
      <OverrideMatchModalContent
        title={title}
        indexerId={indexerId}
        guid={guid}
        movieId={movieId}
        languages={languages}
        quality={quality}
        protocol={protocol}
        isGrabbing={isGrabbing}
        grabError={grabError}
        onGrabRelease={onGrabRelease}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default OverrideMatchModal;
