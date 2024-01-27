import Layout from '../../components/layout';
import { DesktopApi } from '../../desktop';

const About = () => {
  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="About"
      subtitle={`v${APP_VERSION}`}
    >
      <p>
        This software is open source and available{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() =>
            DesktopApi.openUrl(
              'https://github.com/diogomartino/palworld-ds-gui'
            )
          }
        >
          here
        </span>
        . Contributions are welcome.
      </p>
      <p>
        This software is not affiliated with or endorsed by the original authors
        of the software it is intended to manage.
      </p>
      <p>
        Licensed under the{' '}
        <a
          className="text-blue-500 hover:underline"
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noreferrer"
        >
          MIT License
        </a>
        .
      </p>
      <p>
        Created by{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() => DesktopApi.openUrl('https://github.com/diogomartino')}
        >
          Diogo Martino
        </span>
      </p>
    </Layout>
  );
};

export default About;
