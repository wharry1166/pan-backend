require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const eventsData = [
  {
    year: 2021, number: 1,
    name: '进入大学',
    description: '全新的旅程开始了',
    content: '<p><span class="highlight">2021 年秋天</span>，我们的潘哥拖着行李箱走进了大学校门。那天天气很好，阳光透过树荫洒在迎新大道上，到处都是举着牌子的学长学姐。</p><p>刚来南昌的时候宿舍还只有两个人，我相信潘哥永远忘不了王哥喊的口令以及三食堂吃出来的那只蟑螂。</p><blockquote>全新的旅程，从一碗南昌拌粉开始。</blockquote>',
    images: ['assets/images/events/university.jpg']
  },
  {
    year: 2021, number: 2,
    name: '拼多多现金红包已到账',
    description: '点击查看详情',
    content: '<p>关于这件事，我相信我不用介绍太多，看得到这个网站的各位大概率都是<span class="highlight">"拼多多现金红包已到账"</span>的见证者，我们至今仍然不知道潘哥的现金红包拿到了多少钱。</p><blockquote>这是一个流传了四年的谜——潘哥的拼多多红包，到底提现了没有？</blockquote>',
    images: ['assets/images/events/pdd-redpacket.jpg']
  },
  {
    year: 2022, number: 1,
    name: '疫情隔离',
    description: '那段特殊的日子',
    content: '<p><span class="highlight">2022 年</span>，大学生活被疫情切割成了一段一段的。封校、网课、核酸、每日打卡……这些词成了日常。</p><p>在宿舍上网课的日子，其实也有它的好。躺在床上就能上课了（到底听没听你别问），吃饭也不用挤食堂。但长时间被困在小小的宿舍里，人确实会变得压抑，所以潘哥开始了他在地平线 4 的旅途。</p><blockquote>那是一条又一条赛道，也是困在宿舍里的我们，唯一的远方。</blockquote><p>记得解封那天，我和潘哥排了四十分钟的队买了三份浓汁烧，还带了三瓶冰可乐，浓汁烧什么味道我也忘记了，只记得那天太阳很大，空气湿湿的搞得我不是很想去食堂吃。</p>',
    images: []
  },
  {
    year: 2022, number: 2,
    name: '南昌丁俊晖的诞生',
    description: '点击查看详情',
    content: '<p>解封之后我们闲着没事瞎逛，在食堂三楼看到了健身房和四张台球桌，但当时的我们并不知道，<span class="highlight">台球界一颗璀璨的新星</span>正在我们身边悄然升起，我稍微放一个小片段大家就能感觉到实力了。</p><blockquote>以下是见证历史的时刻。</blockquote>',
    images: []
  },
  {
    year: 2023, number: 1,
    name: '入坑塞尔达传说',
    description: '海拉鲁大陆的冒险开始了',
    content: '<p>大概是潘哥开始死磕初会之前的时间，他霸占了我的 switch，大半夜会因为搞到一把大剑很开心的给我发微信，<span class="highlight">现在想想那种很纯粹的因为游戏带来的开心</span>好像也慢慢开始找不到了。</p><blockquote>海拉鲁大陆永远欢迎你，潘哥。</blockquote>',
    images: ['assets/images/events/zelda.jpg']
  },
  {
    year: 2024, number: 1,
    name: '去了趟福州',
    description: '有福之州 · 旅行记录',
    content: '<p>去了三坊七巷，烟台山，长乐（虽然我不知道长乐除了看海还有啥好玩的）吃了鱼丸、肉燕，但是福州大部分食物吃起来都不辣，估计潘哥是吃不惯哈哈哈。</p><p>潘哥来福州的时候正值年后，是福州人游神的时间，我带他去看了次游神，还带去清富的高中看了看，也算是圣地巡礼了，现在也记不太清了具体做了啥，只记得吃了披萨还有大半夜喝了霸王茶姬然后睡不着觉了。</p><blockquote>对于游神我还是很推崇的，希望哥几个都来福州玩，高低给你安排的好好的。</blockquote>',
    images: []
  },
  {
    year: 2025, number: 1,
    name: '歌神的诞生',
    description: '点击查看详情',
    content: '<p>具体七七八八的就不写了，放两段各位自己感受。</p><blockquote>前方高能，建议佩戴耳机。</blockquote>',
    images: ['assets/images/events/singing-1.mp4', 'assets/images/events/singing-2.mp4']
  },
  {
    year: 2025, number: 2,
    name: '又去了一次福州',
    description: '点击查看详情',
    content: '<p>这次是我带潘哥去的福州，想着带他玩几天呢，结果潘哥抽到了盲审，在我家熬了三个通宵…</p><blockquote>福州很好，下次还来（先把论文写完）。</blockquote>',
    images: ['assets/images/events/fuzhou-1.jpg', 'assets/images/events/fuzhou-2.jpg', 'assets/images/events/fuzhou-3.jpg', 'assets/images/events/fuzhou-4.jpg', 'assets/images/events/fuzhou-5.jpg', 'assets/images/events/fuzhou-6.jpg', 'assets/images/events/fuzhou-7.jpg']
  },
  {
    year: 2025, number: 3,
    name: '毕业',
    description: '大学生涯 · 完美落幕',
    content: '<p>全程心里都飘着一首歌<span class="highlight">"又到凤凰花朵开放的时候"</span>，虽然每天看起来其乐融融，但是故事的最后是一抹离别的灰色，发生了很多事，吃了很多顿好的，后来遇到阳光明媚的午后总会觉得仿佛还在学校马上就要一起去吃饭，想起来要拍一张照片留念。</p><blockquote>凤凰花开的路口，有我最珍惜的朋友。</blockquote>',
    images: ['assets/images/events/graduation-1.png', 'assets/images/events/graduation-2.png', 'assets/images/events/graduation-3.png', 'assets/images/events/graduation-4.png', 'assets/images/events/graduation-5.png', 'assets/images/events/graduation-6.png', 'assets/images/events/graduation-7.png']
  }
];

async function seed(force) {
  const dbPath = path.join(__dirname, 'pan.db');
  if (force || process.argv.includes('--force')) {
    try { fs.unlinkSync(dbPath); } catch {}
    console.log('Deleted existing database for fresh seed.');
  }

  const { getDb } = require('./db');
  const db = await getDb();

  const existing = db.prepare('SELECT COUNT(*) AS count FROM events').get();
  if (existing && existing.count > 0) {
    console.log(`Database already has ${existing.count} events, skipping. Use --force to re-seed.`);
    if (require.main === module) process.exit(0);
    return;
  }

  // Create admin user
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
  console.log(`Admin user: ${username}`);

  // Insert events and media
  for (const ev of eventsData) {
    const info = db.prepare(`
      INSERT INTO events (year, number, name, description, content)
      VALUES (?, ?, ?, ?, ?)
    `).run([ev.year, ev.number, ev.name, ev.description, ev.content]);

    const eventId = info.lastInsertRowid;

    ev.images.forEach((filePath, i) => {
      const isVideo = filePath.endsWith('.mp4');
      const ext = filePath.split('.').pop().toLowerCase();
      const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4' };
      db.prepare(`
        INSERT INTO media (event_id, file_path, file_type, is_video, is_default, sort_order)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run([eventId, filePath, mimeMap[ext] || 'image/jpeg', isVideo ? 1 : 0, i]);
    });
  }

  console.log(`Seeded ${eventsData.length} events.`);
  if (require.main === module) process.exit(0);
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
