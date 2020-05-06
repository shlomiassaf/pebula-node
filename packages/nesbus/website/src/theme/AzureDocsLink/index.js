import React from 'react';

import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function typeToSegment(type) {
  switch (type) {
    case 'arm':
      return 'arm-servicebus';
    case 'schemaType':
      return 'service-bus';
  }
  throw new Error(`Unknown link segment type ${type}`);
}

function AzureDocsLink(props) {
  const context = useDocusaurusContext();
  const {
    type,
    symbol,
    display
  } = props;

  const href = `${context.siteConfig.customFields.azureDocsUrl}/${typeToSegment(type)}/${symbol.toLowerCase()}`;
  return (
    <a href={href} target="_blank">{ props.children || display || symbol }</a>
  );
}

export default AzureDocsLink;