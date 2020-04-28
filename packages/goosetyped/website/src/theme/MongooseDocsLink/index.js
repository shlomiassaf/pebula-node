import React from 'react';

import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function typeToSegment(type) {
  switch (type) {
    case 'schema':
      return 'guide';
    case 'schemaType':
      return 'SchemaTypes';
    case 'connection':
      return 'Connections';
    case 'model':
      return 'Models';
    case 'document':
      return 'Documents';
    case 'subDocument':
      return 'subdocs';
    case 'query':
      return 'Queries';
    case 'validation':
      return 'Validation';
    case 'middleware':
      return 'Middleware';
    case 'populate':
      return 'Populate';
    case 'discriminator':
      return 'Discriminators';
    case 'plugins':
      return 'Plugins';
  }
  throw new Error(`Unknown link segment type ${type}`);
}

function MongooseDocsLink(props) {
  const context = useDocusaurusContext();
  const {
    type,
    hash,
    display
  } = props;

  const href = `${context.siteConfig.customFields.mongooseDocsUrl}/${typeToSegment(type).toLowerCase()}.html${hash ? '#' + hash : ''}`;
  return (
    <a href={href} target="_blank">{ props.children || display || hash || ''}</a>
  );
}

export default MongooseDocsLink;