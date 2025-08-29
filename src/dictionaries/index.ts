export const defaultThaiProfanityList = [
  'เหี้ย', 'สัส', 'ควย', 'เย็ด', 'แม่ง', 'กู', 'มึง', 'ไอ้', 'อีดอก', 'ระยำ',
  'หี', 'แตด', 'ห่า', 'ชิบหาย', 'แม่เย็ด', 'พ่อมึงตาย', 'ไอสัตว์', 'อีสัตว์',
  'เชี่ย', 'แม่มึง', 'พ่อมึง', 'ตอแหล', 'ส้นตีน', 'อีห่า', 'อีเหี้ย', 'ไอ้เหี้ย',
  'อีควาย', 'ไอ้ควาย', 'อีชั่ว', 'อีบ้า', 'ไอ้บ้า', 'อีโง่', 'ไอ้โง่', 'อีหน้าด้าน',
  'อีหน้าหี', 'ไอ้หน้าหี', 'อีตัว', 'กระหรี่', 'แรด', 'อีแรด', 'ดอกทอง', 'อีดอกทอง',
  'จัญไร', 'อีจัญไร', 'ขี้', 'ขี้เหร่', 'ขี้โกง', 'ขี้เก๊ก', 'เลว', 'อีเลว', 'สารเลว',
  'หน้าตัวเมีย', 'ตัวเมีย', 'หน้าผี', 'ผีน้อย', 'ไอ้ผี', 'อีผี', 'ทุเรศ', 'อีทุเรศ',
  'เปรต', 'อีเปรต', 'ไอ้เปรต', 'นรก', 'ตกนรก', 'หน้าผาก', 'หน้าโง่', 'โง่เง่า',
  'งั่ง', 'ปัญญาอ่อน', 'สมองน้อย', 'ไร้สมอง', 'ควายถึก', 'ควายเถิก', 'กาก',
  'ขยะ', 'ขยะสังคม', 'ลูกหี', 'ลูกหำ', 'ไอ้หำ', 'อีหำ', 'พ่อง', 'แม่ง', 'น่าเกลียด'
];

export const defaultEnglishProfanityList = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'dick', 'cock', 'pussy',
  'bastard', 'asshole', 'cunt', 'piss', 'whore', 'slut', 'fag', 'faggot',
  'nigger', 'nigga', 'crap', 'bullshit', 'motherfucker', 'fucker', 'fucking',
  'shitty', 'bitchy', 'dickhead', 'jackass', 'dumbass', 'retard', 'retarded',
  'gay', 'homo', 'queer', 'dyke', 'lesbo', 'tranny', 'shemale', 'rape', 'rapist',
  'molest', 'molester', 'pedophile', 'pedo', 'kill', 'murder', 'suicide', 'die',
  'dead', 'death', 'hate', 'nazi', 'hitler', 'racist', 'racism', 'sexist',
  'sexism', 'terrorist', 'terrorism', 'bomb', 'wtf', 'omfg', 'lmao', 'lmfao',
  'stfu', 'gtfo', 'kys', 'kms', 'ffs', 'smh', 'af', 'asf', 'hoe', 'thot',
  'simp', 'incel', 'virgin', 'loser', 'noob', 'trash', 'garbage', 'toxic',
  'cancer', 'aids', 'autistic', 'autism', 'spastic', 'mongoloid', 'midget'
];

export const thaiKaraokeMapping: { [key: string]: string[] } = {
  'เหี้ย': ['hia', 'hea', 'hear', 'heya', 'hiya'],
  'สัส': ['sus', 'sas', 'sat', 'sud', 'sut'],
  'ควย': ['kuay', 'kuai', 'kwai', 'kway', 'quay', 'quai'],
  'เย็ด': ['yed', 'yet', 'yedd', 'yaed', 'yad'],
  'แม่ง': ['maeng', 'mang', 'meang', 'meng'],
  'กู': ['gu', 'goo', 'ku', 'koo', 'guu', 'kuu'],
  'มึง': ['mueng', 'mung', 'meung', 'meung', 'muang'],
  'ไอ้': ['ai', 'i', 'eye', 'aai', 'ii'],
  'อี': ['ee', 'e', 'ii', 'i', 'eee'],
  'หี': ['hee', 'he', 'hi', 'hii', 'heee'],
  'แตด': ['taed', 'tad', 'tat', 'ted', 'taet'],
  'ห่า': ['ha', 'haa', 'har', 'hah'],
  'ชิบหาย': ['chibhai', 'shibhai', 'chiphai', 'shiphay'],
  'ตอแหล': ['torler', 'torlae', 'tohlae', 'tawlae'],
  'ส้นตีน': ['sontien', 'sontean', 'santien', 'santean'],
  'ควาย': ['kwai', 'kway', 'kuai', 'kuay', 'quai', 'quay'],
  'สัตว์': ['sat', 'sud', 'sut', 'satw', 'sutw'],
  'บ้า': ['ba', 'baa', 'bar', 'bah'],
  'โง่': ['ngo', 'ngoh', 'ngor', 'ngaw'],
  'เลว': ['leo', 'lew', 'laew', 'laeo'],
  'ขี้': ['kee', 'khee', 'ki', 'khi', 'khii'],
  'หน้า': ['na', 'naa', 'nar', 'nah', 'nha'],
  'ตัว': ['tua', 'toa', 'tuaa', 'dua', 'doa'],
  'ผี': ['pee', 'phee', 'pi', 'phi', 'phii'],
  'นรก': ['narok', 'narok', 'nalok', 'nalok'],
  'พ่อ': ['por', 'phor', 'paw', 'phaw', 'po'],
  'แม่': ['mae', 'maa', 'ma', 'mea', 'meh'],
  'ลูก': ['luk', 'look', 'luuk', 'louk'],
  'หำ': ['hum', 'ham', 'haam', 'hahm']
};

export const severityMap: { [key: string]: 'mild' | 'moderate' | 'severe' } = {
  'เหี้ย': 'severe',
  'สัส': 'severe',
  'ควย': 'severe',
  'เย็ด': 'severe',
  'หี': 'severe',
  'แตด': 'severe',
  'fuck': 'severe',
  'fucking': 'severe',
  'shit': 'moderate',
  'ass': 'moderate',
  'bitch': 'moderate',
  'damn': 'mild',
  'hell': 'mild',
  'crap': 'mild',
  'bullshit': 'moderate',
  'แม่ง': 'moderate',
  'กู': 'moderate',
  'มึง': 'moderate',
  'ไอ้': 'moderate',
  'อี': 'moderate',
  'บ้า': 'mild',
  'โง่': 'mild',
  'เลว': 'mild'
};

export const englishVariations: { [key: string]: string[] } = {
  'fuck': ['fck', 'fuk', 'fuq', 'fvck', 'f*ck', 'f**k', 'f***'],
  'shit': ['sh1t', 'sh!t', '$hit', 'sh*t', 'sh**', 's**t'],
  'ass': ['@ss', 'a$$', 'a**', '@$$'],
  'bitch': ['b1tch', 'b!tch', 'b*tch', 'bi+ch'],
  'damn': ['d@mn', 'darn', 'd*mn'],
  'dick': ['d1ck', 'd!ck', 'd*ck'],
  'pussy': ['pu$$y', 'p*ssy', 'pu**y'],
  'hell': ['h3ll', 'he!!', 'h*ll']
};

export const thaiVariations: { [key: string]: string[] } = {
  'เหี้ย': [
    'เหี้ยย', 'เหี่ย', 'เฮีย', 'เฮี้ย', 'เหิ่ย', 'เฮิ่ย', 'เหี๋ย', 'เหี๊ย',
    'เหีย', 'เหื่ย', 'เหือ่ย', 'เฮี่ย', 'เฮีย์', 'เฮ้ย', 'เฮียว', 'เฮี๊ย',
    'เหิ่ยเอ้ย', 'เฮิ่ยเอ้ย', 'เหี่ยเอ๊ย', 'เฮีย์เอ้ย', 'เหี่ยเอ่ย', 'เฮิ่ยย์',
    'เอ้ยเฮิ่ย', 'เฮิ่ยๆ', 'เฮิ่ยนะ', 'ไอเหิ่ย', 'ไอเฮีย', 'อีเหิ่ย', 'อีเฮีย'
  ],
  'สัส': [
    'สาส', 'สาด', 'สัด', 'สัสส์', 'ซัส', 'ซาส', 'ส๊าส', 'ส๋าส', 
    'สสส', 'สะส', 'สุส', 'สึส', 'สฺส', 'ส@ส', 'ส*ส', 'ส.ั.ส'
  ],
  'ควย': [
    'คอย', 'ค.ว.ย', 'ค_ว_ย', 'กวย', 'กอย', 'ควาย', 'คุย', 
    'ค9ย', 'คw"ย', 'ค๙ย', 'ควยยยยยย', 'ควยๆลๆ'
  ],
  'แม่ง': ['แม้ง', 'แม่งง', 'ม่ง', 'มง'],
  'กู': [
    'กุ', 'กรู', 'กูู', 'ก.ู', 'กู๋', 'กู๊', 'กu', 'gู', 'กูกู'
  ],
  'มึง': [
    'มุง', 'มึ้ง', 'ม.ึ.ง', 'มรึง', 'มืง', 'มึ่ง', 'มeung', 'muึง'
  ],
  'ไอ้': ['ไอ', 'อิ้', 'ไอ่', 'ไอ๊'],
  'อี': ['อิ', 'อี่', 'อี้', 'อื'],
  'หี': ['ฮี', 'ฮี่', 'ห.ี', 'หิ'],
  'บ้า': ['บ่า', 'บ๊า', 'บ้าา', 'บร้า']
};