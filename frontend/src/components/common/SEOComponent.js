import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOComponent = ({ 
  title = "目的ベースダッシュボード", 
  description = "高山市のAIカメラから取得した歩行者オープンデータを活用。観光地の混雑状況を可視化し、事業者に「やりたいこと」を与え、悩みを解決します。",
  keywords = "高山市,ダッシュボード,観光,混雑度,混雑状況,データ可視化,オープンデータ,データ分析,事業者支援,飛騨高山,MDG,遠藤・浦田研究室",
  url = "https://ai-camera.lab.mdg-meidai.com",
  image = "/assets/dashbord_logo.png",
  type = "website"
}) => {
  const fullTitle = title === "目的ベースダッシュボード" 
    ? "目的ベースダッシュボード" 
    : `${title} | 目的ベースダッシュボード`;

  return (
    <Helmet>
      {/* 基本メタタグ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="目的ベースダッシュボード" />
      <meta property="og:image" content={`https://ai-camera.lab.mdg-meidai.com/${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://ai-camera.lab.mdg-meidai.com/${image}`} />

      {/* 構造化データ */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebPage",
          "name": fullTitle,
          "description": description,
          "url": url,
          "author": {
            "@type": "Organization",
            "name": "Media&Design Group - 遠藤・浦田研究室"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Media&Design Group - 遠藤・浦田研究室"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
          }
        })}
      </script>
    </Helmet>
  );
};

SEOComponent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  url: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string
};

export default SEOComponent;
