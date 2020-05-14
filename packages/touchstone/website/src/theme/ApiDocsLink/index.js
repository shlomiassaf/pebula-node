import React from 'react';

import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function typeToSegment(type) {
  switch (type) {
    case 'interface':
      return 'interfaces';
    case 'globals':
      return 'globals';
  }
  throw new Error(`Unknown link segment type ${type}`);
}

function ApiDocsLink(props) {
  const context = useDocusaurusContext();
  const {
    type,
    symbol,
    hash,
    display
  } = props;

  const href = symbol
    ? `${context.siteConfig.customFields.apiDocsUrl}/${typeToSegment(type)}/${symbol.toLowerCase()}.html${hash ? '#' + hash.toLowerCase() : ''}`
    : `${context.siteConfig.customFields.apiDocsUrl}/${typeToSegment(type)}.html${hash ? '#' + hash.toLowerCase() : ''}`
  ;
  return (
    <a href={href} target="_blank">{ props.children || display || symbol }</a>
  );
}

export default ApiDocsLink;