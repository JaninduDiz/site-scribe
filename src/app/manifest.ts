import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SiteScribe',
    short_name: 'SiteScribe',
    description: 'Employee attendance tracking for construction sites.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E1F5FE',
    theme_color: '#29ABE2',
    icons: [
      {
        src: "https://placehold.co/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://placehold.co/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
