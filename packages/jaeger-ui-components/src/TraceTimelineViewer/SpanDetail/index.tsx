// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { css } from 'emotion';
import cx from 'classnames';

import AccordianKeyValues from './AccordianKeyValues';
import AccordianLogs from './AccordianLogs';
import AccordianText from './AccordianText';
import DetailState from './DetailState';
import { formatDuration } from '../utils';
import CopyIcon from '../../common/CopyIcon';
import LabeledList from '../../common/LabeledList';

import { TNil } from '../../types';
import { KeyValuePair, Link, Log, Span } from '../../types/trace';
import AccordianReferences from './AccordianReferences';
import { createStyle } from '../../Theme';
import { UIDivider } from '../../uiElementsContext';
import { ubFlex, ubFlexAuto, ubItemsCenter, ubM0, ubMb1, ubMy1, ubTxRightAlign } from '../../uberUtilityStyles';

const getStyles = createStyle(() => {
  return {
    divider: css`
      background: #ddd;
    `,
    debugInfo: css`
      display: block;
      letter-spacing: 0.25px;
      margin: 0.5em 0 -0.75em;
      text-align: right;
    `,
    debugLabel: css`
      &::before {
        color: #bbb;
        content: attr(data-label);
      }
    `,
    debugValue: css`
      background-color: inherit;
      border: none;
      color: #888;
      cursor: pointer;
      &:hover {
        color: #333;
      }
    `,
    AccordianWarnings: css`
      background: #fafafa;
      border: 1px solid #e4e4e4;
      margin-bottom: 0.25rem;
    `,
    AccordianWarningsHeader: css`
      background: #fff7e6;
      padding: 0.25rem 0.5rem;
      &:hover {
        background: #ffe7ba;
      }
    `,
    AccordianWarningsHeaderOpen: css`
      border-bottom: 1px solid #e8e8e8;
    `,
    AccordianWarningsLabel: css`
      color: #d36c08;
    `,
  };
});

type SpanDetailProps = {
  detailState: DetailState;
  linksGetter: ((links: KeyValuePair[], index: number) => Link[]) | TNil;
  logItemToggle: (spanID: string, log: Log) => void;
  logsToggle: (spanID: string) => void;
  processToggle: (spanID: string) => void;
  span: Span;
  tagsToggle: (spanID: string) => void;
  traceStartTime: number;
  warningsToggle: (spanID: string) => void;
  referencesToggle: (spanID: string) => void;
  focusSpan: (uiFind: string) => void;
};

export default function SpanDetail(props: SpanDetailProps) {
  const {
    detailState,
    linksGetter,
    logItemToggle,
    logsToggle,
    processToggle,
    span,
    tagsToggle,
    traceStartTime,
    warningsToggle,
    referencesToggle,
    focusSpan,
  } = props;
  const { isTagsOpen, isProcessOpen, logs: logsState, isWarningsOpen, isReferencesOpen } = detailState;
  const { operationName, process, duration, relativeStartTime, spanID, logs, tags, warnings, references } = span;
  const overviewItems = [
    {
      key: 'svc',
      label: 'Service:',
      value: process.serviceName,
    },
    {
      key: 'duration',
      label: 'Duration:',
      value: formatDuration(duration),
    },
    {
      key: 'start',
      label: 'Start Time:',
      value: formatDuration(relativeStartTime),
    },
  ];
  const deepLinkCopyText = `${window.location.origin}${window.location.pathname}?uiFind=${spanID}`;
  const styles = getStyles();

  return (
    <div>
      <div className={cx(ubFlex, ubItemsCenter)}>
        <h2 className={cx(ubFlexAuto, ubM0)}>{operationName}</h2>
        <LabeledList className={ubTxRightAlign} dividerClassName={styles.divider} items={overviewItems} />
      </div>
      <UIDivider className={cx(styles.divider, ubMy1)} />
      <div>
        <div>
          <AccordianKeyValues
            data={tags}
            label="Tags"
            linksGetter={linksGetter}
            isOpen={isTagsOpen}
            onToggle={() => tagsToggle(spanID)}
          />
          {process.tags && (
            <AccordianKeyValues
              className={ubMb1}
              data={process.tags}
              label="Process"
              linksGetter={linksGetter}
              isOpen={isProcessOpen}
              onToggle={() => processToggle(spanID)}
            />
          )}
        </div>
        {logs && logs.length > 0 && (
          <AccordianLogs
            linksGetter={linksGetter}
            logs={logs}
            isOpen={logsState.isOpen}
            openedItems={logsState.openedItems}
            onToggle={() => logsToggle(spanID)}
            onItemToggle={logItem => logItemToggle(spanID, logItem)}
            timestamp={traceStartTime}
          />
        )}
        {warnings && warnings.length > 0 && (
          <AccordianText
            className={styles.AccordianWarnings}
            headerClassName={styles.AccordianWarningsHeader}
            label={<span className={styles.AccordianWarningsLabel}>Warnings</span>}
            data={warnings}
            isOpen={isWarningsOpen}
            onToggle={() => warningsToggle(spanID)}
          />
        )}
        {references && references.length > 1 && (
          <AccordianReferences
            data={references}
            isOpen={isReferencesOpen}
            onToggle={() => referencesToggle(spanID)}
            focusSpan={focusSpan}
          />
        )}
        <small className={styles.debugInfo}>
          <span className={styles.debugLabel} data-label="SpanID:" /> {spanID}
          <CopyIcon
            copyText={deepLinkCopyText}
            icon="link"
            placement="topRight"
            tooltipTitle="Copy deep link to this span"
          />
        </small>
      </div>
    </div>
  );
}
