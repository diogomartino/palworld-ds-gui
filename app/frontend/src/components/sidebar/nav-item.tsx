import { createElement, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import cx from 'classnames';
import useSelectedTheme from '../../hooks/use-selected-theme';
import { TGenericObject } from '../../types';

type TNavItemProps = {
  to?: string;
  label: string;
  onClick?: () => void;
  iconComponent?: React.ComponentType<any>;
  iconProps?: TGenericObject;
};

const NavItem = ({
  to,
  label,
  onClick,
  iconComponent,
  iconProps
}: TNavItemProps) => {
  const navigate = useNavigate();
  const theme = useSelectedTheme();
  const { pathname } = useLocation();

  const activeColor = theme === 'dark' ? '#f8fafc' : '#1e1e1e';

  const isActive = useMemo(() => {
    if (to) {
      const rootPath = `/${pathname.split('/')[1]}`;

      return to.trim().toLowerCase() === rootPath.trim().toLowerCase();
    }

    return false;
  }, [to, pathname]);

  const onItemClick = () => {
    onClick?.();

    if (to) {
      navigate(to);
    }
  };

  const icon = useMemo(() => {
    return iconComponent
      ? createElement(iconComponent as any, {
          size: '1.2rem',
          color: isActive ? activeColor : '#a0a0a0',
          ...iconProps
        })
      : null;
  }, [iconComponent, isActive, activeColor, iconProps]);

  return (
    <div
      className={cx(
        'flex items-center h-[48px] justify-between p-2 cursor-pointer hover:bg-content4 select-none hover:transition-all',
        isActive && 'bg-content3'
      )}
      onClick={onItemClick}
    >
      <div>
        <p
          className={cx(
            'cursor-pointer',
            isActive ? 'text-foreground font-bold' : 'text-neutral-400'
          )}
        >
          {label}
        </p>
      </div>
      <div>{icon}</div>
    </div>
  );
};

export default NavItem;
