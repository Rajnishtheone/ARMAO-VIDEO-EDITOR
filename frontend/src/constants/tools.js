import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SpeedIcon from '@mui/icons-material/Speed';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import OutboxIcon from '@mui/icons-material/Outbox';

export const TOOL_IDS = {
  IMPORT: 'import',
  TRIM: 'trim',
  FILTERS: 'filters',
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  SPEED: 'speed',
  MERGE: 'merge',
  EXPORT: 'export',
};

export const TOOLS = [
  {
    id: TOOL_IDS.IMPORT,
    label: 'Import',
    description: 'Upload video, audio, and image assets',
    icon: CloudUploadIcon,
  },
  {
    id: TOOL_IDS.TRIM,
    label: 'Trim',
    description: 'Trim clips to precise durations',
    icon: ContentCutIcon,
  },
  {
    id: TOOL_IDS.FILTERS,
    label: 'Filters',
    description: 'Adjust brightness, contrast, saturation, or grayscale',
    icon: AutoAwesomeIcon,
  },
  {
    id: TOOL_IDS.TEXT,
    label: 'Text',
    description: 'Add styled text overlays',
    icon: TextFieldsIcon,
  },
  {
    id: TOOL_IDS.IMAGE,
    label: 'Image',
    description: 'Composite logos or watermarks',
    icon: ImageIcon,
  },
  {
    id: TOOL_IDS.AUDIO,
    label: 'Audio',
    description: 'Mute or replace soundtrack',
    icon: AudiotrackIcon,
  },
  {
    id: TOOL_IDS.SPEED,
    label: 'Speed',
    description: 'Create fast or slow motion versions',
    icon: SpeedIcon,
  },
  {
    id: TOOL_IDS.MERGE,
    label: 'Merge',
    description: 'Combine multiple clips into one timeline',
    icon: MergeTypeIcon,
  },
  {
    id: TOOL_IDS.EXPORT,
    label: 'Export',
    description: 'Render and download the finished video',
    icon: OutboxIcon,
  },
];
