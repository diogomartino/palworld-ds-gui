import Sidebar from '../sidebar';
import cx from 'classnames';

type TLayoutProps = {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string | React.ReactNode;
  rightSlot?: React.ReactNode;
};

const Layout = ({
  children,
  className,
  title,
  subtitle,
  rightSlot
}: TLayoutProps) => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className={cx('flex-1 p-4 overflow-auto', className)}>
        <div className="flex items-center justify-between">
          {(title || subtitle) && (
            <div className="flex flex-col gap-1">
              {title && <p className="text-4xl">{title}</p>}
              {subtitle && typeof subtitle === 'string' && (
                <p className="text-sm text-neutral-500">{subtitle}</p>
              )}
              {subtitle && typeof subtitle !== 'string' && subtitle}
            </div>
          )}
          {rightSlot && <div>{rightSlot}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
