import Sidebar from '../sidebar';
import cx from 'classnames';

type TLayoutProps = {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

const Layout = ({ children, className, title, subtitle }: TLayoutProps) => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className={cx('flex-1 p-4 overflow-auto', className)}>
        {(title || subtitle) && (
          <div className="flex flex-col gap-1">
            {title && <p className="text-4xl">{title}</p>}
            {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
