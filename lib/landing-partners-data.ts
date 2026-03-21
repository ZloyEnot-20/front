import { z } from 'zod'
import { landingImagePathSchema, landingPublicImage } from './landing-public-images'

const partnerSchema = z.object({
  href: z.string().url(),
  image: landingImagePathSchema,
})

const raw = [
  ['https://msu.uz', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fb2go051/32adb9dd60511b63763376fe649f6915.png'],
  ['https://kpfu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110i97061/f4d5f78e66f9d7deeab2b527457ded1f.png'],
  ['https://mgimo.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1gbim9051/f5057a95af2ad11d401baf0044fdf869.png'],
  ['https://mospolytech.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110if5061/f6e43a269617e47bbb5fd3e45eca10e9.png'],
  ['https://www.hse.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q24051/1991e6d0a1ebb97090b709781dbfdaea.png'],
  ['https://www.rit.edu/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0pml051/e5cb229120942854ceb9213334d9265c.png'],
  ['https://www.khas.edu.tr/en/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1f5kk4051/91ab6a32ec521c06e1a1bc7eb6231c61.png'],
  ['https://www.volgatech.net/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110iei061/18b0e2abd5aeadaa76d84c0fc8ae18f9.png'],
  ['https://reu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110iia061/2bc19ecf15b0d0614b87d082b3103cc8.png'],
  ['https://pisa.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110iqm061/d42cfabf7cd52e02e9c3a8755d38a56f.png'],
  ['https://www.mirea.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nssk5051/dddc4860c10aa08c408e99d6a00f9206.png'],
  ['https://www.nsu.ru/n/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110igo061/a898b9842548813a6be1e17534a65ae2.png'],
  ['https://panko.lt/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0pp6051/3f6648b9c711e588c833eee4e3617ad5.png'],
  ['https://uwc-z.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110idf061/27162eabbcf5198a8b15f480738eea12.png'],
  ['https://bntu.by/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g3gra051/5901e31fdbfe373f2f560f4dc6aae54d.png'],
  ['https://udea.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110idn061/d4a9f2bd8bd5aa507452ec8faaaf424d.png'],
  ['https://centralasian.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g3gsp051/18508959ab0cbab5fe44e259355e23b9.png'],
  ['https://www.webster.uz/index.php', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nq8gr051/8493ad6706083f18a0d0fdc31a271391.png'],
  ['https://diplomat.university/', '/m/23d0ad303b4883b856ce0760d612e88d/s/8ck4ko051/88e2edc9a5d0721d1303f303afecec01.png'],
  ['https://amity.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nss8h051/7a19508c1e2243b9a0016eea8d21be6a.png'],
  ['https://www.utmn.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1n7e6e051/4e651d0f011e9709aec273132d2b6062.png'],
  ['https://innopolis.university/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110iei061/2cd19ed104698ee511f64588975617e6.png'],
  ['http://www.kgau.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/7a88ig051/41d91dbdb0971f3262291a83c7ee631c.png'],
  ['https://kai.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ig4061/b3176a0c6588bc53d8b789a44100b041.png'],
  ['https://www.herzen.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q1h051/d793482c63833fb1b1713088b7f242d6.png'],
  ['https://kazast.edu.kz/ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1f5kl7051/8c2dd604b149e946112fd15eda104e20.png'],
  ['https://www.turan-edu.kz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ih7061/dfb6bcb77cb6ee48b2e44323551f4162.png'],
  ['https://www.kimep.kz/ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/9d9s5p051/1f799c174142933d0e546c6abf2d161c.png'],
  ['https://shokan.edu.kz/ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110if1061/2ddb3412b8a2f379bc2ddb0b5ab3dc1d.png'],
  ['https://uib.edu.kz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/4f06049bf07fff20738b72864c7776cc.png'],
  ['https://inpsycho.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ig8061/d4423457e112155641445280d3141bb7.png'],
  ['https://iga.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0prg051/5db16b5e5dcdf70656c6d49f0d7bb717.png'],
  ['https://www.sibupk.su/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110imm061/91bfcfddc140fceab7099ee3634ca588.png'],
  ['https://spmi.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/8cempb051/5cba3157b2e5d30205912f3d83e4deb7.png'],
  ['https://stankin.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nsshg051/8a54a83a3a9e410cbeb0202f3feb5e43.png'],
  ['https://tmci.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nnhkl051/13cc85e78cd79cd786245f5c32b093a9.png'],
  ['https://renessans-edu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/62b08a1c4da0c133ff2ad71c313b9844.png'],
  [
    'https://uzgeouniver.uz/ru/news/Saksoniya%20oliygohlarining%20O%E2%80%98zbekistondagi%C2%A0%20Ofisi%20ochildi',
    '/m/23d0ad303b4883b856ce0760d612e88d/s/2110i9b061/a6a3a9a040817a305ff994388df64e5b.png',
  ],
  ['https://turin.uz/uz/uz-2/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/3b0e1fbea95f866b1e99e5c42b5fc9b4.png'],
  ['https://p.lodz.pl/en', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nssfq051/1e2c132bd0978fc8cfcc7b3041e79246.png'],
  ['https://www.gau.edu.tr/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/566c5ff58aa9a370c67d3fec4171c705.png'],
  ['https://imes.su/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1nssf6051/80a7861f3e0778520d2b4c45afef554a.png'],
  ['https://www.utmn.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/8be6jm051/9de5f9937d4150ab8ed3a9a910f35b32.png'],
  ['https://caa.edu.kz/enrollee', '/m/23d0ad303b4883b856ce0760d612e88d/s/1flo00051/df43a3d21b4ad8e5bbd05a159ed8ab0b.png'],
  ['https://qyzpu.edu.kz/ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/8d00017a8fe324b59c835387f1b39904.png'],
  ['https://umft.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr5ri051/b20db5729f7619edf5234ca2cf98c517.png'],
  ['https://utas.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ics061/e3f549b7f11407d78e420edf9cd433b5.png'],
  ['https://ubsu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/8bm8da051/accbaee459c3e231a057f4568e833871.png'],
  ['https://azmiu.edu.az/ru/pages/66', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ib9061/50bd261810559722d236468f87f3e0d3.png'],
  ['http://itpu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr61j051/ed34af9d42ba5113d87b70a3a8b11932.png'],
  ['https://aut-edu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110idn061/395ed1152f327fe9476e975ae3b7fbed.png'],
  ['https://isft.uz/ru/about', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr5r6051/917ba71e47a0545d1756b8b4ace66198.png'],
  ['https://www.nosu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0png051/d6422895c9df4b1b4c1a17f9d07e2285.png'],
  ['https://uztitu.uz/ru', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/be07eaf61cac3977e0ca2322a883d488.png'],
  ['https://ssau.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0pp6051/4033fddcf294f61f9d822468c3215c60.png'],
  ['https://zhetysu.edu.kz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/9cs6ec051/d2a6f88e3684b5c26beab0b499d0e494.png'],
  ['https://kmept.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0phq051/541770297b44acdd36bc3354a5195c34.png'],
  ['https://oxu.uz/international', '/m/23d0ad303b4883b856ce0760d612e88d/s/8c414b051/fd19f89ff72bd5639434d86bd7270e35.png'],
  ['https://www.uni.lodz.pl/en/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1k0cco051/3d2b5f7bf9638ea88f888407d5e91672.png'],
  ['https://www.apu.edu.my/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr626051/8a2c08cc04ed794d4818ed81e50048a5.png'],
  ['https://tstu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ie6061/bb5bc26e780e8caa21d4040c152f3287.png'],
  ['https://www.aydin.edu.tr/tr-tr/Pages/default.aspx', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g3gsp051/956d11194d27bbb8d3921fe6adc44e7a.png'],
  ['https://www.spbstu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110if1061/4fe9d0963962c0b314a32fdc2627a447.png'],
  ['https://vsuet.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1k0cl3051/1c42a10c9b434573bfff4d9e3310bb21.png'],
  ['https://www.wust.edu/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110id3061/f93a69e3052b9fa7a834a6db1097936b.png'],
  ['https://www.beykent.edu.tr/en', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/98e98c82b5323ba71757778d05192415.png'],
  ['https://www.flemingcollegetoronto.ca/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1k0cc8051/fa4fbd04e0c1c51a06e8fe3f4915ecf0.png'],
  ['https://www.gsom.polimi.it/en/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr5l0051/6db23ae172c1cacabeec204f016a0948.png'],
  ['https://uskudar.edu.tr/en', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fdme4051/4272cad2c83ed9e48b9ef7d172bb1176.png'],
  ['https://uust.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110ico061/1f0a6463aef612d65541e99ff57e6f91.png'],
  ['https://www.dogus.edu.tr/en', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fj4a4051/aacd5e8f58e827d9b6fb4e477b9f7cc3.png'],
  ['https://mgsu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1k0cdn051/cdfd918790666d7e0f8ed2253f3885aa.png'],
  ['https://kbsu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1g0q20051/44204d61a8223162be558059fec5c9b9.png'],
  ['https://www.ksma.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110idr061/c1c396d67a6e380b060eeb9e877b826d.png'],
  ['https://www.kstu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1eqirj051/27cc60d03914eb7d7698977c0ee340e4.png'],
  ['https://itmo.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1o2j87051/b9bada80b35d21c761734b3776d9895f.png'],
  ['https://www.spbu.uz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/9dnbo9051/c8f11be28ef2779194a496f0020406c1.png'],
  ['https://www.fsm.edu.tr/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1o2jbo051/3488218533bae46b028b683a4cc2054e.png'],
  ['https://int.beykoz.edu.tr/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1fr648051/604724b9210a0d295c87bce7caec8b8d.png'],
  ['https://arucad.edu.tr/en/home/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110if9061/b3d6a62421e39f01a9b09c82c7b97fe6.png'],
  ['https://www.nisantasi.edu.tr/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1eih3k051/5cbac8de530e70c9e8bb463e63ea8677.png'],
  ['https://halic.edu.tr/en', '/m/23d0ad303b4883b856ce0760d612e88d/s/9dfa1l051/3a5495ca74f53a35a18c280d491b32d6.png'],
  ['https://mtuci.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/2110igo061/acde8a5a9c573cb6bea2da453928080a.png'],
  ['https://mok.edu.kz/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1enrs0051/74d4a589f23c484ad575e81f7eab32fc.png'],
  ['https://www.npi-tu.ru/', '/m/23d0ad303b4883b856ce0760d612e88d/s/1o2jjs051/90cc33bb5072dd6ab28fb1a90f1c5d2e.png'],
] as const

function toPartner([href, path]: readonly [string, string]) {
  const file = path.split('/').pop()
  if (!file) throw new Error(`Invalid partner asset path: ${path}`)
  return { href, image: landingPublicImage(file) }
}

export type LandingPartnerLogo = z.infer<typeof partnerSchema>

export const LANDING_PARTNER_LOGOS: LandingPartnerLogo[] = z.array(partnerSchema).parse(raw.map(toPartner))

/** Ровно 3 ряда × 5 колонок на десктопе */
export const LANDING_PARTNER_SLIDE_SIZE = 15

export function chunkPartnerSlides(partners: LandingPartnerLogo[]): LandingPartnerLogo[][] {
  if (!partners.length) return []
  const slides: LandingPartnerLogo[][] = []
  for (let i = 0; i < partners.length; i += LANDING_PARTNER_SLIDE_SIZE) {
    const chunk = partners.slice(i, i + LANDING_PARTNER_SLIDE_SIZE)
    if (chunk.length < LANDING_PARTNER_SLIDE_SIZE) {
      const padded = [...chunk]
      let k = 0
      while (padded.length < LANDING_PARTNER_SLIDE_SIZE) {
        padded.push(partners[k % partners.length])
        k++
      }
      slides.push(padded)
    } else {
      slides.push(chunk)
    }
  }
  return slides
}
