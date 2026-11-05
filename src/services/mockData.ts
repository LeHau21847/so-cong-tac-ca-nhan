// src/services/mockData.ts
import { WorkItem } from '../types';

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  {
    id: 'item-dtn-001',
    title: 'Ra quân Ngày Chủ nhật Xanh dọn vệ sinh tuyến đường Thanh niên tự quản',
    category: 'doan_thanh_nien',
    type: 'completed_log',
    status: 'done',
    date: '2026-11-01',
    time: '07:30 - 10:30',
    location: 'Tuyến đường hoa thanh niên liên thôn, Xã Tân Triều',
    description: 'Huy động 35 đoàn viên thanh niên thu gom hơn 200kg rác thải nhựa, phát quang 2.5km hành lang an toàn giao thông và trồng bổ sung 150 cây hoa giấy.',
    images: [
      {
        id: 'img-dtn-01',
        url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        caption: 'Đoàn viên thanh niên tích cực dọn dẹp và làm đẹp tuyến đường',
        createdAt: '2026-11-01T08:15:00.000Z'
      },
      {
        id: 'img-dtn-02',
        url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
        caption: 'Trồng hoa và phát quang bụi rậm bảo đảm an toàn giao thông',
        createdAt: '2026-11-01T09:40:00.000Z'
      }
    ],
    isHighlighted: true,
    createdAt: '2026-11-01T07:30:00.000Z',
    updatedAt: '2026-11-01T10:45:00.000Z',
  },
  {
    id: 'item-antt-001',
    title: 'Tuần tra đêm phòng chống tội phạm địa bàn tổ dân phố 3 & 4',
    category: 'antt_co_so',
    type: 'completed_log',
    status: 'done',
    date: '2026-11-03',
    time: '21:00 - 23:30',
    location: 'Khu vực chợ trung tâm và các ngõ hẻm giáp ranh',
    description: 'Phối hợp Công an xã và lực lượng bảo vệ ANTT cơ sở tuần tra 8 lượt. Nhắc nhở 4 hộ kinh doanh khóa cổng cẩn thận, giải tán 1 nhóm thanh thiếu niên tụ tập đêm gây ồn ào.',
    images: [
      {
        id: 'img-antt-01',
        url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
        caption: 'Lực lượng ANTT cơ sở kiểm tra tuyến phố trong ca tuần tra đêm',
        createdAt: '2026-11-03T21:45:00.000Z'
      }
    ],
    isHighlighted: true,
    createdAt: '2026-11-03T21:00:00.000Z',
    updatedAt: '2026-11-03T23:45:00.000Z',
  },
  {
    id: 'item-antt-002',
    title: 'Hòa giải thành công mâu thuẫn tranh chấp ranh giới đất tại Thôn 2',
    category: 'antt_co_so',
    type: 'completed_log',
    status: 'done',
    date: '2026-11-04',
    time: '14:00 - 16:30',
    location: 'Nhà văn hóa Thôn 2',
    description: 'Chủ trì tổ chức hòa giải giữa hộ ông Nguyễn Văn A và hộ ông Trần Văn B. Sau khi giải thích pháp luật và quy chuẩn hiện trạng, hai bên đã bắt tay thống nhất cắm mốc ranh giới.',
    images: [
      {
        id: 'img-antt-02',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        caption: 'Biên bản thống nhất hòa giải cơ sở được ký kết',
        createdAt: '2026-11-04T16:15:00.000Z'
      }
    ],
    isHighlighted: true,
    createdAt: '2026-11-04T14:00:00.000Z',
    updatedAt: '2026-11-04T16:45:00.000Z',
  },
  {
    id: 'item-dtn-002',
    title: 'Thăm tặng quà Mẹ Việt Nam Anh hùng và cựu cán bộ Đoàn có hoàn cảnh khó khăn',
    category: 'doan_thanh_nien',
    type: 'completed_log',
    status: 'done',
    date: '2026-10-27',
    time: '08:30 - 11:00',
    location: 'Gia đình Mẹ VNAH Lê Thị H. và cựu cán bộ Đoàn thôn 1',
    description: 'Trao tặng 2 suất quà trị giá 3.000.000đ do đoàn viên quyên góp và hỗ trợ dọn dẹp nhà cửa, sơn sửa lại hàng rào.',
    images: [
      {
        id: 'img-dtn-03',
        url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
        caption: 'Đoàn công tác thăm hỏi và trao quà',
        createdAt: '2026-10-27T09:30:00.000Z'
      }
    ],
    isHighlighted: true,
    createdAt: '2026-10-27T08:30:00.000Z',
    updatedAt: '2026-10-27T11:15:00.000Z',
  },
  {
    id: 'item-other-001',
    title: 'Trực tiếp nhận hồ sơ hành chính & giải quyết kiến nghị của công dân',
    category: 'cong_viec_khac',
    type: 'completed_log',
    status: 'done',
    date: '2026-11-05',
    time: '08:00 - 11:30',
    location: 'Bộ phận một cửa UBND Xã',
    description: 'Tiếp đón và xử lý 18 lượt hồ sơ xác nhận lý lịch tư pháp, đăng ký biến động đất đai và trả lời thắc mắc thủ tục hành chính công trực tuyến.',
    images: [],
    isHighlighted: false,
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-05T11:45:00.000Z',
  },
  {
    id: 'item-sched-001',
    title: 'Họp Ban Thường vụ Đoàn Xã chuẩn bị Đại hội Đoàn nhiệm kỳ mới',
    category: 'doan_thanh_nien',
    type: 'scheduled',
    status: 'todo',
    date: '2026-11-06',
    time: '14:00 - 16:30',
    location: 'Phòng họp số 2 UBND Xã',
    description: 'Thảo luận dự thảo văn kiện báo cáo chính trị Đại hội, phân công nhân sự các tiểu ban nội dung, hậu cần, tuyên truyền và biểu quyết thông qua danh sách trù bị.',
    images: [],
    isHighlighted: true,
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'item-sched-002',
    title: 'Họp Ban Chỉ đạo 138 về đảm bảo ANTT dịp lễ hội và cao điểm cuối năm',
    category: 'antt_co_so',
    type: 'scheduled',
    status: 'todo',
    date: '2026-11-08',
    time: '08:30 - 11:00',
    location: 'Hội trường lớn UBND Xã',
    description: 'Đánh giá tình hình ANTT tháng 10, triển khai kế hoạch cao điểm tấn công trấn áp tội phạm ma túy, cờ bạc, pháo nổ trước tết nguyên đán.',
    images: [],
    isHighlighted: false,
    createdAt: '2026-11-05T10:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
  },
  {
    id: 'item-sched-003',
    title: 'Tập huấn kỹ năng chuyển đổi số & Dịch vụ công trực tuyến cho Thanh niên',
    category: 'doan_thanh_nien',
    type: 'scheduled',
    status: 'todo',
    date: '2026-11-12',
    time: '08:00 - 11:30',
    location: 'Phòng máy tính Trường THCS',
    description: 'Hướng dẫn thanh niên kích hoạt định danh VNeID mức 2 cho nhân dân và số hóa hồ sơ thủ tục hành chính.',
    images: [],
    isHighlighted: false,
    createdAt: '2026-11-05T11:00:00.000Z',
    updatedAt: '2026-11-05T11:00:00.000Z',
  }
];

