export type Order = {
  id: number;
  name: string;
  price: number;
  order_number: string;
  due_date: string;
  status: 'finished' | 'unfinished';
  created_at: string;
  is_notif_send: boolean;
  phone: string;
};