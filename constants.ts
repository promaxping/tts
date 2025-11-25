import type { VoiceCategory, ToneOption } from './types';

export const VOICE_OPTIONS: VoiceCategory[] = [
  {
    label: 'Giọng Nữ',
    options: [
      { value: 'Kore', label: 'Kore: Giọng nữ trong trẻo, kể chuyện' },
      { value: 'Zephyr', label: 'Zephyr: Giọng nữ nhẹ nhàng, thư giãn' },
      { value: 'Aoede', label: 'Aoede: Giọng nữ sang trọng, đĩnh đạc' },
    ]
  },
  {
    label: 'Giọng Nam',
    options: [
      { value: 'Puck', label: 'Puck: Giọng nam tinh nghịch, hoạt bát' },
      { value: 'Charon', label: 'Charon: Giọng nam trầm lắng, huyền bí' },
      { value: 'Fenrir', label: 'Fenrir: Giọng nam mạnh mẽ, gầm gừ' },
    ]
  }
];


export const TONE_OPTIONS: ToneOption[] = [
  { value: '', label: 'Mặc định' },
  { value: 'kể chuyện, truyền cảm', label: 'Kể chuyện', defaultRate: 0.9 },
  { value: 'giọng kể chuyện ru ngủ, cực kỳ chậm rãi, nhẹ nhàng và êm ái', label: 'Kể chuyện ru ngủ', defaultRate: 0.7 },
  { value: 'sôi nổi, thuyết phục', label: 'Quảng cáo', defaultRate: 1.15 },
  { value: 'trang trọng, rõ ràng', label: 'Tin tức', defaultRate: 1.1 },
  { value: 'nhẹ nhàng, chậm rãi', label: 'Sách nói' },
  { value: 'vui tươi, thân thiện', label: 'Trẻ em' },
  { value: 'chuyên nghiệp, lịch sự', label: 'Tổng đài' },
  { value: 'custom', label: 'Khác (nhập bên dưới)' },
];

export const CHUNK_MAX_LENGTH = 600; // Reduced to prevent API timeout/limit errors with audio generation