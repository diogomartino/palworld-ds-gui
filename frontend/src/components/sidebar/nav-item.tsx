import { createElement, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import cx from 'classnames';

type TNavItemProps = {
  to?: string;
  label: string;
  onClick?: () => void;
  iconComponent?: React.ComponentType<any>;
};

const NavItem = ({ to, label, onClick, iconComponent }: TNavItemProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
          color: isActive ? '#f8fafc' : '#a3a3a3'
        })
      : null;
  }, [iconComponent, isActive]);

  return (
    <div
      className={cx(
        'flex items-center h-[48px] justify-between p-2 cursor-pointer hover:bg-default-100 select-none hover:transition-all',
        isActive && 'bg-default-100'
      )}
      onClick={onItemClick}
    >
      <div>
        <p
          className={cx(
            'text-neutral-400',
            isActive && 'text-[#f8fafc] font-bold' // hex is used here because tailwind is not as it should with text-neutral (maybe a bug)
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
