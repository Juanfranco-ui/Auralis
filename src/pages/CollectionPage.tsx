import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryView } from '../components/LibraryView';
import { SeoHead } from '../components/SeoHead';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { openBookDetail } = useAudioPlayer();

  return (
    <>
      <SeoHead
        title="Mi Colección · Auralis Audiolibros"
        description="Tu biblioteca personal de audiolibros: audición en curso, obras favoritas guardadas y marcadores de tiempo con notas de texto personalizadas."
        canonicalPath="/coleccion"
      />
      <LibraryView
        onSelectBook={(book) => openBookDetail(book)}
        onExploreClick={() => navigate('/')}
      />
    </>
  );
};
