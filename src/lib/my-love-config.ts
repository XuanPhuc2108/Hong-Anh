export const relationshipDates = {
  firstConversation: '2026-10-26',
  relationshipStart: '2026-11-01',
} as const;

export type PlaylistTrack = {
  title: string;
  artist?: string;
  byline?: string;
  artwork?: string;
  note?: string;
  url?: string;
};

export const playlists: {
  id: 'anh' | 'phuc';
  title: string;
  description: string;
  platform: 'Spotify' | 'YouTube';
  url: string;
  artwork: string;
  tracks: PlaylistTrack[];
}[] = [
  {
    id: 'anh',
    title: 'Playlist của Ánh',
    description: 'Những bài hát Ánh đã thêm vào playlist.',
    platform: 'Spotify',
    url: 'https://open.spotify.com/playlist/6GnX4viZ92RH1Ux8E6I02o?si=cC_UUnR6Q1uPW2bRILOYCg&utm_source=copy-link&pi=TYy5qA92T5qoV&pt=b54eddcf43cc5d8e1b3360a586718626',
    artwork: 'https://mosaic.scdn.co/300/ab67616d00001e024992bf290fe8c9f82a0e66e4ab67616d00001e0276c10c0497647b0cee2dba35ab67616d00001e02819219f4ea0ad1e11cb78411ab67616d00001e02fb24fcf5cd43a2bbc3dfa99f',
    tracks: [
      { title: 'Vết Mưa', artist: 'Vũ Cát Tường', url: 'https://open.spotify.com/track/5cn5oHiXJTLiuthgbgfkMh' },
      { title: 'Tại Vì Sao', artist: 'RPT MCK', url: 'https://open.spotify.com/track/3MH9SzXnX4ZPz2jkDim6Sg' },
      { title: 'Già Cùng Nhau Là Được', artist: 'Tùng TeA, PC, TaynguyenSound', url: 'https://open.spotify.com/track/0jHpGB1Xt2kIX0VaPFvStp' },
      { title: "ex's hate me, Pt.2", artist: 'AMEE', url: 'https://open.spotify.com/track/5tdz7T4hTxA1ipJMBe24uX' },
      { title: 'Não Cá Vàng', artist: 'Only C, Lou Hoàng', url: 'https://open.spotify.com/track/5WqyMMhbVsV7yR8lSNy5EI' },
      { title: "Ex's Hate Me", artist: 'B Ray, AMEE', url: 'https://open.spotify.com/track/6su7ekPw5AAIU2OUCvos6S' },
      { title: 'Cơn Mưa Cuối', artist: 'JustaTee, Binz', url: 'https://open.spotify.com/track/6E3P4uOfKHYXJLK6Q3s0Tj' },
      { title: 'She Neva Knows', artist: 'JustaTee', url: 'https://open.spotify.com/track/0NyrI1tMvqcK3vU5z9DMdI' },
      { title: 'Từng Là Của Nhau', artist: 'Bảo Anh, Táo', url: 'https://open.spotify.com/track/5KYv3kORBKUmVEoqbRRWxt' },
      { title: 'Có Ai Thương Em Như Anh', artist: 'Tóc Tiên, Touliver', url: 'https://open.spotify.com/track/7AD5F85waSb3yZxZxEXhJM' },
      { title: 'My Everything', artist: 'Tiên Tiên', url: 'https://open.spotify.com/track/2IHuCVweZ7UCWfpucXR0HR' },
      { title: 'Mơ', artist: 'Vũ Cát Tường', url: 'https://open.spotify.com/track/2a5hng9yXtbjtTVVm9UviC' },
      { title: '10 Ngàn Năm', artist: 'PC', url: 'https://open.spotify.com/track/2pm7K14nHj2fLrpU8j9bit' },
      { title: 'Có Hay Từ Bao Giờ? (feat. KEI)', artist: 'Nie, Hast, KEI', url: 'https://open.spotify.com/track/5Cl1QyJ1U2HLhNjyals2G1' },
      { title: 'Phai', artist: 'Rocky CDE, Chie', url: 'https://open.spotify.com/track/42ajbrD1sow2nEGPGxPPRl' },
      { title: 'Vùng An Toàn', artist: 'B Ray, V#', url: 'https://open.spotify.com/track/6Zoi4ue74UdUeYmHXItXnf' },
    ],
  },
  {
    id: 'phuc',
    title: 'Playlist của Phúc',
    description: 'Những bài hát Phúc đã thêm vào playlist.',
    platform: 'YouTube',
    url: 'https://www.youtube.com/playlist?list=PLZEhMIjJAUlc',
    artwork: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
    tracks: [
      { title: 'Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack', byline: 'Wiz Khalifa', url: 'https://www.youtube.com/watch?v=RgKAFK5djSk&list=PLZEhMIjJAUlc' },
      { title: 'Buông Đôi Tay Nhau Ra | OFFICIAL MUSIC VIDEO | Sơn Tùng M-TP', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=LCyo565N_5w&list=PLZEhMIjJAUlc' },
      { title: 'Roddy Ricch - The Box [Official Music Video]', byline: 'Roddy Ricch', url: 'https://www.youtube.com/watch?v=UNZqm3dxd2w&list=PLZEhMIjJAUlc' },
      { title: 'Lil Nas X - Industry Baby (Lyrics) ft. Jack Harlow', byline: 'The Vibe Guide', url: 'https://www.youtube.com/watch?v=HCq1OcAEAm0&list=PLZEhMIjJAUlc' },
      { title: 'DONALD GOLD - ĐỔI TƯ THẾ x ANDREE RIGHT HAND | OFFICIAL MUSIC VIDEO', byline: 'Donald Gold', url: 'https://www.youtube.com/watch?v=wkMwq6NUUmM&list=PLZEhMIjJAUlc' },
      { title: 'Donald Gold - Trăng Hoa Mây Mưa', byline: 'Donald Gold', url: 'https://www.youtube.com/watch?v=SPTUEeGW50E&list=PLZEhMIjJAUlc' },
      { title: 'Andree Right Hand - Công Ty 4 ft. Dangrangto, TeuYungBoy, WOKEUP | Official MV', byline: 'Andree Right Hand', url: 'https://www.youtube.com/watch?v=XGuPrOY8ieI&list=PLZEhMIjJAUlc' },
      { title: 'CENTRAL CEE FT. LIL BABY - BAND4BAND (MUSIC VIDEO)', byline: 'Central Cee', url: 'https://www.youtube.com/watch?v=pDddlvCfTiw&list=PLZEhMIjJAUlc' },
      { title: 'Imagine Dragons - Bones (Official Music Video)', byline: 'ImagineDragons', url: 'https://www.youtube.com/watch?v=TO-_3tck2tg&list=PLZEhMIjJAUlc' },
      { title: 'Chạy Ngay Đi', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=Hg-eKLuK2bU&list=PLZEhMIjJAUlc' },
      { title: 'Chơi Như Tụi Mỹ', byline: 'Andree Right Hand', url: 'https://www.youtube.com/watch?v=umKLy_E5Dyk&list=PLZEhMIjJAUlc' },
      { title: 'NGOTHWAAN - SAO BĂNG TRUNG ĐÔNG - OFFICIAL LYRICS VIDEO', byline: 'Dvd The MC', url: 'https://www.youtube.com/watch?v=pzK52t9OKqE&list=PLZEhMIjJAUlc' },
      { title: "Kid Cudi - Day 'N' Nite", byline: "Fool's Gold Records", url: 'https://www.youtube.com/watch?v=iD0mNoEYpZw&list=PLZEhMIjJAUlc' },
      { title: 'The Black Eyed Peas - Rock That Body (Official Music Video)', byline: 'Black Eyed Peas', url: 'https://www.youtube.com/watch?v=nmnjL26OBcY&list=PLZEhMIjJAUlc' },
      { title: '7 Years', byline: 'Lukas Graham', url: 'https://www.youtube.com/watch?v=vTMAa6zZ7jY&list=PLZEhMIjJAUlc' },
      { title: 'SƠN TÙNG M-TP | MUỘN RỒI MÀ SAO CÒN | OFFICIAL MUSIC VIDEO', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=xypzmu5mMPY&list=PLZEhMIjJAUlc' },
      { title: 'Lạc Trôi', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=RKvRLLQtDbg&list=PLZEhMIjJAUlc' },
      { title: 'Đừng Làm Trái Tim Anh Đau', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=7u4g483WTzw&list=PLZEhMIjJAUlc' },
      { title: 'Heat Waves', byline: 'Glass Animals', url: 'https://www.youtube.com/watch?v=XDjB9E3YtUE&list=PLZEhMIjJAUlc' },
      { title: 'Mood', byline: '24kGoldn', url: 'https://www.youtube.com/watch?v=UNOtbkQxECI&list=PLZEhMIjJAUlc' },
      { title: 'Hãy Trao Cho Anh', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=emMR03tG2CE&list=PLZEhMIjJAUlc' },
      { title: 'STAY', byline: 'The Kid LAROI.', url: 'https://www.youtube.com/watch?v=XfEMj-z3TtA&list=PLZEhMIjJAUlc' },
      { title: 'FE!N', byline: 'Travis Scott', url: 'https://www.youtube.com/watch?v=2nR1zrNzgcY&list=PLZEhMIjJAUlc' },
      { title: 'Nơi Này Có Anh', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=qHpE45b4INk&list=PLZEhMIjJAUlc' },
      { title: 'Come My Way', byline: 'Sơn Tùng M-TP Official', url: 'https://www.youtube.com/watch?v=Pv8urr9RH6Y&list=PLZEhMIjJAUlc' },
      { title: 'Lighter', byline: 'Jelly Roll', url: 'https://www.youtube.com/watch?v=5FvRS8Q7DGY&list=PLZEhMIjJAUlc' },
      { title: 'Believer', byline: 'ImagineDragons', url: 'https://www.youtube.com/watch?v=Kx7B-XvmFtE&list=PLZEhMIjJAUlc' },
      { title: 'Một Nửa Sự Thật', byline: '24kRight', url: 'https://www.youtube.com/watch?v=rmx6FsiHrJo&list=PLZEhMIjJAUlc' },
      { title: 'Trap Queen', byline: 'Harlem Fetty', url: 'https://www.youtube.com/watch?v=ZjODWsHFo5Y&list=PLZEhMIjJAUlc' },
      { title: 'Blue Tequila', byline: 'Táo', url: 'https://www.youtube.com/watch?v=qw8kPS9z-A0&list=PLZEhMIjJAUlc' },
      { title: 'Em iu', byline: 'Andree Right Hand', url: 'https://www.youtube.com/watch?v=KVaFisERfro&list=PLZEhMIjJAUlc' },
      { title: 'MAKA', byline: 'Central Cee', url: 'https://www.youtube.com/watch?v=BN71pgouDkI&list=PLZEhMIjJAUlc' },
      { title: 'Nhạc Anh (feat. Wxrdie)', byline: 'Andree Right Hand', url: 'https://www.youtube.com/watch?v=2tiTrA9DzQ0&list=PLZEhMIjJAUlc' },
      { title: 'Astronaut In The Ocean', byline: 'Masked Wolf', url: 'https://www.youtube.com/watch?v=5-FGxUINL-Q&list=PLZEhMIjJAUlc' },
      { title: 'Doja', byline: 'Central Cee', url: 'https://www.youtube.com/watch?v=Txnqzr_DZYg&list=PLZEhMIjJAUlc' },
      { title: 'Ransom', byline: 'Lil Tecca', url: 'https://www.youtube.com/watch?v=BX27kva5HlA&list=PLZEhMIjJAUlc' },
      { title: 'Big Dawgs', byline: 'Hanumankind', url: 'https://www.youtube.com/watch?v=JCf7lKL1UQ4&list=PLZEhMIjJAUlc' },
      { title: 'Sprinter', byline: 'Santan Dave', url: 'https://www.youtube.com/watch?v=TtSr-J-SYMw&list=PLZEhMIjJAUlc' },
      { title: 'Wxrdie - TETVOVEN (ft. @AndreeRightHand87 & @MachiotOfficial) | OFFICIAL MUSIC VIDEO', byline: 'Wxrdie', url: 'https://www.youtube.com/watch?v=4k2verGRZNw&list=PLZEhMIjJAUlc' },
      { title: 'Charlie Puth - Attention [Official Video]', byline: 'Charlie Puth', url: 'https://www.youtube.com/watch?v=nfs8NYg7yQM&list=PLZEhMIjJAUlc' },
      { title: 'Enemy (From the series Arcane League of Legends)', byline: 'ImagineDragons', url: 'https://www.youtube.com/watch?v=vxa8ShIm9yw&list=PLZEhMIjJAUlc' },
      { title: 'Bad Liar', byline: 'ImagineDragons', url: 'https://www.youtube.com/watch?v=I203G1sMGDg&list=PLZEhMIjJAUlc' },
      { title: 'Hymn for the Weekend', byline: 'Coldplay', url: 'https://www.youtube.com/watch?v=H3Kzh6RrnMc&list=PLZEhMIjJAUlc' },
      { title: "You Don't Know Me (feat. Brodie Barclay)", byline: 'Ofenbach', url: 'https://www.youtube.com/watch?v=QczaWdKb0W8&list=PLZEhMIjJAUlc' },
      { title: 'Ludwig Van Beethoven: Symphony No. 5, Op. 67', byline: 'Classic Flames - Topic', url: 'https://www.youtube.com/watch?v=wsz2KRqpMhI&list=PLZEhMIjJAUlc' },
      { title: "Love Is A Long Road (From 'GTA 6') - Epic Version", byline: 'The Baltic House', url: 'https://www.youtube.com/watch?v=ZIjVF7eNwm0&list=PLZEhMIjJAUlc' },
    ],
  },
];
