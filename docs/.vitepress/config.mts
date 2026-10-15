import { readFileSync } from 'node:fs';
import { type DefaultTheme, type HeadConfig, defineConfig } from 'vitepress';

const repo = 'https://github.com/maitrungduc1410/react-native-zalo-kit';
const base = '/react-native-zalo-kit/';
// Production origin + base. Sitemap URLs and canonical links are built from it.
const site = `https://maitrungduc1410.github.io${base}`;
const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
) as { version: string };

// Written by `yarn api` (TypeDoc) before VitePress runs.
const apiSidebar = JSON.parse(
  readFileSync(new URL('../api/typedoc-sidebar.json', import.meta.url), 'utf8')
) as DefaultTheme.SidebarItem[];

type Slug = (typeof groups)[number][number];

type Labels = {
  guide: string;
  api: string;
  changelog: string;
  groups: [string, string, string, string];
  pages: Record<Slug, string>;
};

const groups = [
  ['', 'installation', 'zalo-app'],
  ['expo', 'ios', 'android'],
  ['login', 'tokens', 'profile', 'errors'],
  ['migration', 'troubleshooting', 'known-issues'],
] as const;

function guideSidebar(prefix: string, l: Labels): DefaultTheme.SidebarItem[] {
  return groups.map((group, i) => ({
    text: l.groups[i],
    items: group.map((slug) => ({
      text: l.pages[slug],
      link: `${prefix}/guide/${slug}`,
    })),
  }));
}

function themeConfig(prefix: string, l: Labels): DefaultTheme.Config {
  return {
    nav: [
      {
        text: l.guide,
        link: `${prefix}/guide/`,
        activeMatch: `^${prefix}/guide/`,
      },
      { text: l.api, link: '/api/', activeMatch: '^/api/' },
      {
        text: `v${version}`,
        items: [
          { text: l.changelog, link: `${repo}/releases` },
          {
            text: 'npm',
            link: 'https://www.npmjs.com/package/react-native-zalo-kit',
          },
        ],
      },
    ],
    sidebar: {
      [`${prefix}/guide/`]: guideSidebar(prefix, l),
      '/api/': [{ text: l.api, link: '/api/', items: apiSidebar }],
    },
  };
}

const en: Labels = {
  guide: 'Guide',
  api: 'API reference',
  changelog: 'Changelog',
  groups: ['Introduction', 'Setup', 'Usage', 'Reference'],
  pages: {
    '': 'What is Zalo Kit?',
    'installation': 'Installation',
    'zalo-app': 'Create a Zalo app',
    'expo': 'Expo',
    'ios': 'iOS (React Native CLI)',
    'android': 'Android (React Native CLI)',
    'login': 'Login',
    'tokens': 'Tokens and sessions',
    'profile': 'User profile',
    'errors': 'Error handling',
    'migration': 'Migrating from 5.x',
    'troubleshooting': 'Troubleshooting',
    'known-issues': 'Known Zalo-side issues',
  },
};

const vi: Labels = {
  guide: 'Hướng dẫn',
  api: 'Tài liệu API',
  changelog: 'Nhật ký thay đổi',
  groups: ['Giới thiệu', 'Thiết lập', 'Sử dụng', 'Tham khảo'],
  pages: {
    '': 'Zalo Kit là gì?',
    'installation': 'Cài đặt',
    'zalo-app': 'Tạo ứng dụng Zalo',
    'expo': 'Expo',
    'ios': 'iOS (React Native CLI)',
    'android': 'Android (React Native CLI)',
    'login': 'Đăng nhập',
    'tokens': 'Token và phiên đăng nhập',
    'profile': 'Thông tin người dùng',
    'errors': 'Xử lý lỗi',
    'migration': 'Nâng cấp từ 5.x',
    'troubleshooting': 'Khắc phục sự cố',
    'known-issues': 'Lỗi đã biết từ phía Zalo',
  },
};

const zh: Labels = {
  guide: '指南',
  api: 'API 参考',
  changelog: '更新日志',
  groups: ['入门', '配置', '使用', '参考'],
  pages: {
    '': '什么是 Zalo Kit？',
    'installation': '安装',
    'zalo-app': '创建 Zalo 应用',
    'expo': 'Expo',
    'ios': 'iOS（React Native CLI）',
    'android': 'Android（React Native CLI）',
    'login': '登录',
    'tokens': 'Token 与会话',
    'profile': '用户资料',
    'errors': '错误处理',
    'migration': '从 5.x 升级',
    'troubleshooting': '故障排查',
    'known-issues': 'Zalo 端已知问题',
  },
};

// SEO: locale metadata used for hreflang and og:locale.
const seoLocales = {
  root: { prefix: '', lang: 'en-US', og: 'en_US' },
  vi: { prefix: 'vi/', lang: 'vi-VN', og: 'vi_VN' },
  zh: { prefix: 'zh/', lang: 'zh-CN', og: 'zh_CN' },
} as const;
type SeoLocale = keyof typeof seoLocales;

function localeOf(page: string): SeoLocale {
  const first = page.split('/')[0];
  return first === 'vi' || first === 'zh' ? first : 'root';
}

/** `guide/index.md` -> `guide/`, `api/functions/login.md` -> `api/functions/login`. */
function pageUrl(page: string): string {
  return page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
}

/** Description for generated TypeDoc pages, which have no frontmatter. */
function apiDescription(relativePath: string): string | undefined {
  const m = relativePath.match(/^api\/(?:(\w[\w-]*)\/)?([^/]+)\.md$/);
  if (!m) return undefined;
  const [, kind, name] = m;
  const lib = 'react-native-zalo-kit';
  switch (kind) {
    case undefined:
      return `API reference for ${lib}: every exported function, constant and type, generated from the TypeScript source.`;
    case 'functions':
      return `API reference for ${name}() in ${lib}: signature, parameters, return value and errors.`;
    case 'interfaces':
      return `API reference for the ${name} interface in ${lib}, listing every property with its type and description.`;
    case 'type-aliases':
      return `API reference for the ${name} type in ${lib}.`;
    case 'variables':
      return `API reference for the ${name} constant in ${lib}.`;
    default:
      return undefined;
  }
}

export default defineConfig({
  title: 'Zalo Kit',
  description:
    'Zalo SDK for React Native and Expo: sign users in with Zalo, keep their session fresh and read their profile.',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    ['meta', { name: 'theme-color', content: '#0573ff' }],
  ],
  sitemap: {
    // VitePress 1.6 builds item URLs without `base`, so the hostname carries it.
    hostname: site,
    transformItems: (items) =>
      items.map((item) => {
        const en = item.links?.find((l) => l.lang === seoLocales.root.lang);
        return en
          ? { ...item, links: [...item.links!, { lang: 'x-default', url: en.url }] }
          : item;
      }),
  },
  transformPageData(pageData) {
    const description = apiDescription(pageData.relativePath);
    if (description && !pageData.frontmatter.description) {
      return {
        description,
        frontmatter: { ...pageData.frontmatter, description },
      };
    }
  },
  transformHead({ page, pageData, siteConfig, title, description }) {
    if (page === '404.md' || pageData.isNotFound) {
      return [['meta', { name: 'robots', content: 'noindex' }]];
    }
    const locale = localeOf(page);
    const key = locale === 'root' ? page : page.slice(locale.length + 1);
    const url = site + pageUrl(page);
    const exists = new Set(siteConfig.pages);
    const variants = (Object.keys(seoLocales) as SeoLocale[]).filter((l) =>
      exists.has(seoLocales[l].prefix + key)
    );

    const head: HeadConfig[] = [['link', { rel: 'canonical', href: url }]];
    if (variants.length > 1) {
      for (const l of variants) {
        head.push([
          'link',
          {
            rel: 'alternate',
            hreflang: seoLocales[l].lang,
            href: site + pageUrl(seoLocales[l].prefix + key),
          },
        ]);
      }
      if (variants.includes('root')) {
        head.push([
          'link',
          { rel: 'alternate', hreflang: 'x-default', href: site + pageUrl(key) },
        ]);
      }
    }
    const og: [string, string][] = [
      ['og:type', pageData.frontmatter.layout === 'home' ? 'website' : 'article'],
      ['og:site_name', 'Zalo Kit'],
      ['og:title', title],
      ['og:description', description],
      ['og:url', url],
      ['og:locale', seoLocales[locale].og],
      ...variants
        .filter((l) => l !== locale)
        .map((l): [string, string] => ['og:locale:alternate', seoLocales[l].og]),
    ];
    for (const [property, content] of og) {
      head.push(['meta', { property, content }]);
    }
    head.push(['meta', { name: 'twitter:card', content: 'summary' }]);
    return head;
  },
  // The demo GIFs in images/ are large; they are copied as-is.
  vite: { build: { chunkSizeWarningLimit: 2000 } },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: themeConfig('', en),
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi-VN',
      description:
        'Zalo SDK cho React Native và Expo: đăng nhập bằng Zalo, tự làm mới token và lấy thông tin người dùng.',
      themeConfig: {
        ...themeConfig('/vi', vi),
        outline: { level: [2, 3], label: 'Trên trang này' },
        docFooter: { prev: 'Trang trước', next: 'Trang sau' },
        lastUpdated: { text: 'Cập nhật lần cuối' },
        editLink: {
          pattern: `${repo}/edit/master/docs/:path`,
          text: 'Sửa trang này trên GitHub',
        },
        returnToTopLabel: 'Về đầu trang',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Giao diện',
        lightModeSwitchTitle: 'Chuyển sang giao diện sáng',
        darkModeSwitchTitle: 'Chuyển sang giao diện tối',
        langMenuLabel: 'Đổi ngôn ngữ',
        notFound: {
          title: 'KHÔNG TÌM THẤY TRANG',
          quote: 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.',
          linkText: 'Về trang chủ',
        },
        footer: { message: 'Phát hành theo giấy phép MIT.' },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      description:
        '适用于 React Native 和 Expo 的 Zalo SDK：使用 Zalo 登录、自动刷新 Token，并获取用户资料。',
      themeConfig: {
        ...themeConfig('/zh', zh),
        outline: { level: [2, 3], label: '页面导航' },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新于' },
        editLink: {
          pattern: `${repo}/edit/master/docs/:path`,
          text: '在 GitHub 上编辑此页',
        },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        langMenuLabel: '切换语言',
        notFound: {
          title: '页面未找到',
          quote: '你访问的页面不存在或已被移动。',
          linkText: '返回首页',
        },
        footer: { message: '基于 MIT 许可证发布。' },
      },
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: repo }],
    search: {
      provider: 'local',
      options: {
        locales: {
          vi: {
            translations: {
              button: { buttonText: 'Tìm kiếm', buttonAriaLabel: 'Tìm kiếm' },
              modal: {
                displayDetails: 'Hiển thị chi tiết',
                resetButtonTitle: 'Xóa tìm kiếm',
                backButtonTitle: 'Đóng tìm kiếm',
                noResultsText: 'Không có kết quả cho',
                footer: {
                  selectText: 'chọn',
                  navigateText: 'di chuyển',
                  closeText: 'đóng',
                },
              },
            },
          },
          zh: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除查询',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关结果',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
    editLink: {
      // Serialized into the client bundle, so it cannot use variables from this file. API pages
      // are generated from the doc comments in src.
      pattern: ({ filePath }) =>
        filePath.startsWith('api/')
          ? 'https://github.com/maitrungduc1410/react-native-zalo-kit/tree/master/src'
          : `https://github.com/maitrungduc1410/react-native-zalo-kit/edit/master/docs/${filePath}`,
      text: 'Edit this page on GitHub',
    },
    outline: { level: [2, 3] },
    footer: { message: 'Released under the MIT License.' },
  },
});
