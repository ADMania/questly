import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/cms/'],
        },
        sitemap: 'https://quest.cdmerch.ru/sitemap.xml',
    };
}
