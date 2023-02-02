import * as React from 'react';
import { SPONSOR_LINK } from '../../constants/Links';
import { HeartIcon } from './Icons/HeartIcon';

export interface ISponsorMsgProps {
  isBacker: boolean | undefined;
}

const SponsorMsg: React.FunctionComponent<ISponsorMsgProps> = ({
  isBacker
}: React.PropsWithChildren<ISponsorMsgProps>) => {
  if (isBacker) {
    return null;
  }

  return (
    <p className={`sponsor`}>
      <a href={SPONSOR_LINK} title="Support Front Matter">
        <span>Support</span> <HeartIcon className={`h-5 w-5 mr-2`} /> <span>FrontMatter</span>
      </a>
    </p>
  );
};

SponsorMsg.displayName = 'SponsorMsg';
export { SponsorMsg };
