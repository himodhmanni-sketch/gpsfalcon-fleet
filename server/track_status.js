import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/gpswox_fleet'
});

async function main() {
  try {
    const devRes = await pool.query(
      "SELECT id, name, imei, current_lat, current_lng, current_speed, current_heading, status, last_update, current_address, odometer FROM devices WHERE imei = '869727071244774'"
    );
    if (!devRes.rows.length) {
      console.log('Device not found!');
      return;
    }
    const dev = devRes.rows[0];
    console.log('====================================================');
    console.log('🚗 حالة المركبة الآن (مهيمن - 869727071244774)');
    console.log('====================================================');
    console.log(`اسم المركبة: ${dev.name}`);
    console.log(`معرف الجهاز: ${dev.id}`);
    console.log(`الإحداثيات الحالية: [${dev.current_lat}, ${dev.current_lng}]`);
    console.log(`السرعة الحالية: ${dev.current_speed} كم/س`);
    console.log(`الاتجاه: ${dev.current_heading}°`);
    console.log(`الحالة: ${dev.status === 'moving' ? '🟢 متحركة (Moving)' : '🛑 متوقفة (Stopped)'}`);
    console.log(`آخر تحديث مستلم: ${dev.last_update}`);
    console.log(`العنوان التقريبي: ${dev.current_address || 'طرابلس، خلة الفرجان / قصر بن غشير'}`);
    console.log(`المسافة المقطوعة (عداد): ${dev.odometer} كم`);

    const countRes = await pool.query(
      "SELECT count(*) as total_points FROM positions WHERE device_id = $1",
      [dev.id]
    );
    console.log(`\nإجمالي النقاط المسجلة في المسار: ${countRes.rows[0].total_points} نقطة`);

    const historyRes = await pool.query(
      "SELECT to_char(recorded_at, 'HH24:MI:SS') as time, latitude, longitude, speed, heading, ignition, address FROM positions WHERE device_id = $1 ORDER BY recorded_at DESC LIMIT 15",
      [dev.id]
    );
    console.log('\n📍 آخر 15 نقطة في خط السير المباشر (من الأحدث للأقدم):');
    console.table(historyRes.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
