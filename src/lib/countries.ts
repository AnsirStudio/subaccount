export const countryNames: Record<string, { zh: string; en: string }> = {
  PH: { zh: "菲律宾", en: "Philippines" },
  PK: { zh: "巴基斯坦", en: "Pakistan" },
  CA: { zh: "加拿大", en: "Canada" },
  JP: { zh: "日本", en: "Japan" },
  VN: { zh: "越南", en: "Vietnam" },
  KR: { zh: "韩国", en: "South Korea" },
  EG: { zh: "埃及", en: "Egypt" },
  ID: { zh: "印度尼西亚", en: "Indonesia" },
  BR: { zh: "巴西", en: "Brazil" },
  AR: { zh: "阿根廷", en: "Argentina" },
  US: { zh: "美国", en: "United States" },
  KZ: { zh: "哈萨克斯坦", en: "Kazakhstan" },
  IN: { zh: "印度", en: "India" },
  AU: { zh: "澳大利亚", en: "Australia" },
  TH: { zh: "泰国", en: "Thailand" },
  TR: { zh: "土耳其", en: "Turkey" },
  AE: { zh: "阿联酋", en: "United Arab Emirates" },
  TW: { zh: "台湾", en: "Taiwan" },
  CL: { zh: "智利", en: "Chile" },
  NG: { zh: "尼日利亚", en: "Nigeria" },
  MX: { zh: "墨西哥", en: "Mexico" },
  SG: { zh: "新加坡", en: "Singapore" },
  IL: { zh: "以色列", en: "Israel" },
  SA: { zh: "沙特", en: "Saudi Arabia" },
  MY: { zh: "马来西亚", en: "Malaysia" },
  ZA: { zh: "南非", en: "South Africa" },
  CH: { zh: "瑞士", en: "Switzerland" },
  NO: { zh: "挪威", en: "Norway" },
  DE: { zh: "德国", en: "Germany" },
  FR: { zh: "法国", en: "France" },
  GB: { zh: "英国", en: "United Kingdom" },
  DK: { zh: "丹麦", en: "Denmark" },
  CO: { zh: "哥伦比亚", en: "Colombia" },
  HK: { zh: "香港", en: "Hong Kong" },
};

const countryCodeByZhName: Record<string, string> = Object.fromEntries(
  Object.entries(countryNames).map(([code, names]) => [names.zh, code]),
);

export function countryCodeForZhName(name: string) {
  const code = countryCodeByZhName[name];
  if (!code) throw new Error(`Unknown country name: ${name}`);
  return code;
}
