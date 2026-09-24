import React from 'react';

export default function DisasterDetail({ item, onBack, darkMode }) {
  if (!item) return null;

  // Detalyadong gabay para sa bawat tiyak na sakuna
  const guideDetails = {
    1: { // Bagyo at Unos (Typhoons)
      before: [
        'Kumpunihin ang mga sirang bahagi ng bahay gaya ng bubong at bintana.',
        'Ihanda ang Emergency Go-Bag na may pagkain, tubig, gamot, at flashlight.',
        'I-charge ang mga mobile phone at power bank habang may kuryente pa.',
        'Alamin ang pinakamalapit na evacuation center sa inyong barangay.'
      ],
      during: [
        'Manatili sa loob ng bahay o sa opisyal na evacuation center.',
        'Makinig sa mga huling ulat sa radyo o opisyal na pahina ng PAGASA at LGU.',
        'Iwasang lumapit sa mga bintana at salamin kung malakas ang hangin.',
        'I-off ang main switch ng kuryente kung tumataas ang tubig-baha.'
      ],
      after: [
        'Maghintay ng abiso mula sa LGU bago bumalik sa tahanan.',
        'Maging maingat sa mga lagot na kable ng kuryente at sirang estruktura.',
        'Suriin ang mga nakaimbak na pagkain at tubig kung ligtas pa ring kainin/inumin.',
        'Magsuot ng angkop na proteksyon tulad ng bota kapag maglilinis ng paligid.'
      ]
    },
    2: { // Baha (Flooding)
      before: [
        'Itaas sa matataas na lugar ang mga gamit sa bahay at mahahalagang kasangkapan.',
        'Mag-imbak ng malinis na tubig at pagkaing hindi madaling mapanis.',
        'Ihanda at tiyaking accessible ang Go-Bag at importanteng mga dokumento.',
        'Alamin kung bahain ang inyong lugar at ang pinakaligtas na daan sa paglikas.'
      ],
      during: [
        'Huwag na huwag lumusong sa baha upang makaiwas sa leptospirosis at kuryente.',
        'Kapag mabilis na tumataas ang tubig, agad na lumikas sa mataas na lugar o evacuation center.',
        'Iwasang magmaneho sa mga daluyan o kalsadang may baha.',
        'Patayin ang main breaker ng kuryente bago lisanin ang bahay.'
      ],
      after: [
        'Umuwi lamang kapag idineklarang ligtas na ng mga awtoridad.',
        'I-disinfect at linisin nang maigi ang mga gamit na nabasa ng tubig-baha.',
        'Ipatiyak sa lisensyadong elektrisyan na ligtas na ang mga linya ng kuryente bago buksan ang breaker.',
        'Pakuluan ang tubig bago inumin para makasiguro sa kalinisan nito.'
      ]
    },
    3: { // Lindol (Earthquakes)
      before: [
        'I-secure ang matataas at mabibigat na kasangkapan tulad ng cabinet at refrigerator sa pader.',
        'Makisali sa mga regular na Earthquake Drill sa komunidad o paaralan.',
        'Magtukoy ng ligtas na lugal sa bawat silid (sa ilalim ng matibay na mesa).',
        'Ihanda ang Go-Bag at iimbak sa lugar na madaling makuha kapag mabilisang tatakbo.'
      ],
      during: [
        'Isagawa agad ang DUCK, COVER, and HOLD hanggang sa huminto ang pag-yanig.',
        'Kung nasa labas, lumayo sa mga gusali, poste ng kuryente, at malalaking puno.',
        'Kung nagmamaneho, itabi ang sasakyan sa ligtas na lugar at manatili sa loob.',
        'Huwag gagamit ng elepador (elevator) kapag nagkakalindol.'
      ],
      after: [
        'Maghanda sa mga posibleng aftershocks o kasunod na pag-yanig.',
        'Suriin ang sarili at pamilya kung may mga sugat o pinsala.',
        'Suriin ang bahay kung may mga bitak o pinsala sa structural integrity.',
        'Kung may amoy ng gas o usok, buksan ang mga bintana at lumabas agad ng bahay.'
      ]
    },
    4: { // Sunog (Fire Safety)
      before: [
        'Regular na ipa-check ang mga linya ng kuryente at huwag mag-overload ng outlets.',
        'Maglagay ng Smoke Detector at Fire Extinguisher sa madaling maabot na lugar.',
        'Magsanay ng emergency escape plan kasama ang buong pamilya.',
        'Tiyaking patay ang kalan at nakasara ang LPG regulator kapag hindi ginagamit.'
      ],
      during: [
        'Kapag may usok, gumapang nang mababa dahil mas malinis ang hangin sa ibaba.',
        'Isagawa ang STOP, DROP, and ROLL kapag nag-apoy ang iyong damit.',
        'Lumabas agad ng gusali at huwag nang bumalik para kumuha ng gamit.',
        'Tumawag agad sa BFP o emergency hotline pagkalabas sa ligtas na lugar.'
      ],
      after: [
        'Huwag pumasok sa nasunog na gusali hangga\'t walang pahintulot mula sa Bureau of Fire Protection.',
        'Magpatingin sa doktor kung nakahinga ng maraming usok o may mga paspas/pasa.',
        'Ipagbigay-alam sa insurance o barangay officials ang naging pinsala ng sunog.',
        'Suriin ang mga naiwang gamit bago subukang gamitin ulit.'
      ]
    },
    5: { // Kawalan ng Kuryente (Power Outage)
      before: [
        'Mag-imbak ng mga ekstrang baterya, kandila, pospuro, at emergency lights.',
        'Panatilihing puno ang charge ng mga cellphones at power banks.',
        'Maghanda ng mga ready-to-eat na pagkain na hindi nangangailangan ng pagluluto o ref.',
        'Ihanda ang radio na gumagamit ng baterya para sa balita.'
      ],
      during: [
        'I-unplug ang mga sensitibong appliances upang maiwasan ang damage sa power surge kapag bumalik ang kuryente.',
        'Iwasang buksan nang buksan ang refrigerator para manatiling malamig ang pagkain.',
        'Gumamit ng flashlight sa halip na kandila kapag may mga bata para maiwasan ang sunog.',
        'Panatilihing sarado ang mga pinto at bintana kung naka-aircon bago nawalan ng kuryente.'
      ],
      after: [
        'Muling i-plug ang mga appliances nang isa-isa pagkalipas ng ilang minuto mula sa pagbabalik ng kuryente.',
        'Suriin ang mga nakaimbak na frozen food kung sira o panis na.',
        'I-charge agad ang mga ginamit na emergency light at power bank para sa susunod na gamit.',
        'I-report sa power distribution utility kung ang inyong bahay lang ang walang kuryente.'
      ]
    },
    6: { // Pagsabog ng Bulkan (Volcanic Eruption)
      before: [
        'Mag-imbak ng N95 masks o basahang pwedeng basain para sa ashfall.',
        'Alamin ang evacuation alert levels mula sa PHIVOLCS.',
        'Protektahan ang mga alagang hayop at pananim kung nasa danger zone.',
        'Tiyaking nakatago at nakatakip ang mga imbak na tubig-inumin.'
      ],
      during: [
        'Magsuot ng N95 mask, long sleeves, at goggles upang maprotektahan ang baga at mata sa abo.',
        'Manatili sa loob ng bahay kapag may matinding ashfall.',
        'Isara ang lahat ng pintuan at bintana upang hindi makapasok ang abong bulto.',
        'Sumunod agad sa panawagan ng evacuation mula sa LGU.'
      ],
      after: [
        'Linisin ang abo sa bubong upang maiwasan ang pagbagsak nito dahil sa bigat.',
        'Basain ng bahagya ang abo bago walisin para hindi ito magliparan sa hangin.',
        'Hugasan nang mabuti ang mga gulay at prutas bago kainin.',
        'Siguraduhing malinis ang daluyan ng tubig bago ito gamitin.'
      ]
    },
    7: { // Pagguho ng Lupa (Landslide)
      before: [
        'Mag-ingat sa mga senyales tulad ng bitak sa lupa, nakatagilid na puno, o pagbabago sa agos ng tubig.',
        'Huwag magtayo ng bahay sa matatarik na gulod o sa may paanan ng kabundukan.',
        'Alamin ang mga ligtas na evacuation route palayo sa mga delikadong dalisdis.',
        'Maging alerto kapag may patuloy at malakas na pag-ulan sa inyong lugar.'
      ],
      during: [
        'Kung nakakakita o nakakarinig ng senyales ng pagguho, mabilis na lumikas palayo sa dalisdis.',
        'Kung hindi na makalikas, mag-curl up sa isang matibay na sulok at protektahan ang ulo.',
        'Makinig sa mga abiso ng lokal na pamahalaan.',
        'Umiwas sa mga ilog at daluyan ng putik at bato.'
      ],
      after: [
        'Manatiling malayo sa lugar ng landslide dahil posible pa ang mga kasunod na pagguho.',
        'Ipagbigay-alam sa mga tagapagligtas ang mga posibleng natabunan o nawawalang kapitbahay.',
        'Suriin ang mga linya ng kuryente at patubig para sa anumang pinsala.',
        'Maghintay ng pahintulot mula sa mga eksperto bago muling bumalik sa bahay.'
      ]
    },
    8: { // Tsunami Warning
      before: [
        'Alamin kung ang inyong tirahan ay nasa coastal tsunami hazard zone.',
        'Tandaan ang mga natural na senyales: malakas na lindol, kakaibang ingay mula sa dagat, at mabilis na pagliit ng tubig-dagat.',
        'Tukuyin ang pinakamalapit na mataas na lugar (mga 30 metro pataas mula sa sea level).',
        'Magsanay sa mabilisang pagtakbo patungo sa mataas na lugar.'
      ],
      during: [
        'Kapag nakaramdam ng malakas na lindol sa dalampasigan, MABILIS NA TUMAKBO SA MATAAS NA LUGAR agad.',
        'Huwag na huwag maghintay ng opisyal na tsunami warning kapag nakita ang mga natural na senyales.',
        'Huwag pumunta sa dalampasigan para panoorin ang tsunami.',
        'Manatili sa mataas na lugar dahil ang tsunami ay binubuo ng serye ng maraming malalaking alon.'
      ],
      after: [
        'Manatili sa ligtas at mataas na lugar hangga\'t walang opisyal na "All Clear" signal mula sa PHIVOLCS/LGU.',
        'Umiwas sa mga naipong tubig-dagat dahil sa panganib ng kuryente at mga debris.',
        'Magbigay ng paunang lunas sa mga nasugatan kung may kakayahan.',
        'Makinig sa radyo para sa mga update at tagubilin mula sa mga awtoridad.'
      ]
    },
    9: { // Paghahanda ng Emergency Go-Bag
      before: [
        'Pumili ng matibay at waterproof na backpack para sa bawat miyembro ng pamilya.',
        'Gumawa ng checklist ng mga kakailanganing gamit para sa 72 oras (3 araw).',
        'Ilagay ang Go-Bag sa lugar na madaling maabot kapag kailangang mabilisang lumikas (hal. malapit sa pinto).',
        'Suriin at i-update ang laman ng Go-Bag bawat 6 na buwan (check expiration ng pagkain at gamot).'
      ],
      during: [
        'Bitbitin agad ang Go-Bag sa oras na magkaroon ng utos para sa paglikas (evacuation).',
        'Isabit sa katawan at tiyaking libre ang dalawang kamay habang naglalakad o lumilikas.',
        'Panatilihing nakasara nang maigi ang bag para hindi mabasa ang mga laman nito.',
        'Huwag nang mag-atubiling magbitbit ng iba pang mabibigat na kasangkapan bukod sa Go-Bag.'
      ],
      after: [
        'Gamitin ang mga supply mula sa Go-Bag habang naghihintay ng tulong sa evacuation center.',
        'I-replenish o palitan agad ang mga nagamit na gamot, pagkain, at tubig.',
        'Linisin at patuyuin ang bag kung ito ay nabasa o nadumihan sa paglikas.',
        'Suriin kung may kailangang idagdag na bagong pangangailangan ng pamilya.'
      ]
    }
  };

  // Kukunin ang partikular na detalye batay sa item.id, o gagamitin ang default kung wala
  const currentDetail = guideDetails[item.id] || {
    before: item.before || [
      'Ihanda ang Emergency Go-Bag na naglalaman ng pagkain, tubig, at gamot.',
      'Alamin ang pinakamalapit na evacuation center at ang pinakaligtas na daan papunta rito sa inyong barangay.',
      'I-charge ang mga mobile phone, power bank, at magtabi ng flashlight at extra baterya.'
    ],
    during: item.during || [
      'Manatili sa loob ng bahay o sa ligtas na evacuation center at lumayo sa mga delikadong lugar.',
      'Sundin ang opisyal na babala at panawagan sa paglikas mula sa mga awtoridad at LGU.',
      'Patayin ang pangunahing switch ng kuryente at valve ng gasul kung kinakailangan.'
    ],
    after: item.after || [
      'Maghintay ng opisyal na payo mula sa LGU o MDRRMO bago bumalik sa tahanan.',
      'Mag-ingat sa mga lagot na kable ng kuryente, sirang poste, at nasirang estruktura.',
      'Siguraduhing malinis at ligtas ang inuming tubig bago ito inumin.'
    ]
  };

  // Dynamic Styles batay sa darkMode status
  const cardBg = darkMode ? '#1e2621' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#212529';
  const subTextColor = darkMode ? '#a3b8cc' : '#6c757d';
  const listTextColor = darkMode ? '#d1d5db' : '#495057';
  const heroBadgeBg = darkMode ? '#2d4336' : '#e8f5e9';
  const heroBadgeColor = darkMode ? '#6ee7b7' : '#2e7d32';

  return (
    <div className={`container-fluid py-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
      {/* Back Button */}
      <button 
        className={`btn btn-sm mb-3 fw-semibold ${darkMode ? 'btn-outline-light text-white-50' : 'btn-outline-success'}`} 
        onClick={onBack}
      >
        <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
      </button>

      {/* Main Hero Card */}
      <div 
        className="card shadow-sm border-0 overflow-hidden mb-4 rounded-3 transition-all" 
        style={{ backgroundColor: cardBg, color: textColor }}
      >
        <div className="row g-0 align-items-center">
          <div className="col-md-5">
            <img 
              src={item.image} 
              className="img-fluid h-100 w-100 object-fit-cover" 
              alt={item.title} 
              style={{ minHeight: '250px', maxHeight: '300px', objectFit: 'cover' }} 
            />
          </div>
          <div className="col-md-7">
            <div className="card-body p-4">
              <span 
                className="badge mb-2 px-3 py-2 fs-6 fw-semibold" 
                style={{ backgroundColor: heroBadgeBg, color: heroBadgeColor }}
              >
                Emergency Preparedness Guide
              </span>
              <h2 className="card-title fw-bold mb-2">{item.title}</h2>
              <p className="card-text mb-4 fs-6" style={{ color: subTextColor }}>{item.description}</p>
              
              <button 
                className="btn px-4 fw-semibold text-white d-inline-flex align-items-center gap-2" 
                style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                onClick={() => alert('Guide saved for offline reading!')}
              >
                <i className="bi bi-download"></i> Save Guide Offline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Action Cards (Dynamic Content & Dynamic Theme) */}
      <div className="row g-4">
        {/* BAGO (BEFORE) */}
        <div className="col-md-4">
          <div 
            className="card h-100 shadow-sm border-0 border-top border-warning border-4 rounded-3 transition-all" 
            style={{ backgroundColor: cardBg, color: textColor }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <i className="bi bi-shield-exclamation fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0 text-warning">Bago (Before)</h5>
              </div>
              <ul className="list-unstyled mb-0">
                {currentDetail.before.map((point, index) => (
                  <li key={index} className="d-flex align-items-start gap-2 mb-3 fs-6" style={{ color: listTextColor }}>
                    <i className="bi bi-check-circle-fill text-warning mt-1 flex-shrink-0"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* HABANG (DURING) */}
        <div className="col-md-4">
          <div 
            className="card h-100 shadow-sm border-0 border-top border-danger border-4 rounded-3 transition-all" 
            style={{ backgroundColor: cardBg, color: textColor }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0 text-danger">Habang (During)</h5>
              </div>
              <ul className="list-unstyled mb-0">
                {currentDetail.during.map((point, index) => (
                  <li key={index} className="d-flex align-items-start gap-2 mb-3 fs-6" style={{ color: listTextColor }}>
                    <i className="bi bi-exclamation-circle-fill text-danger mt-1 flex-shrink-0"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* PAGKATAPOS (AFTER) */}
        <div className="col-md-4">
          <div 
            className="card h-100 shadow-sm border-0 border-top border-success border-4 rounded-3 transition-all" 
            style={{ backgroundColor: cardBg, color: textColor }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <i className="bi bi-patch-check-fill fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0 text-success">Pagkatapos (After)</h5>
              </div>
              <ul className="list-unstyled mb-0">
                {currentDetail.after.map((point, index) => (
                  <li key={index} className="d-flex align-items-start gap-2 mb-3 fs-6" style={{ color: listTextColor }}>
                    <i className="bi bi-check-square-fill text-success mt-1 flex-shrink-0"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}