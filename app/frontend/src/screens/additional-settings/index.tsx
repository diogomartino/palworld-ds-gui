import Layout from '../../components/layout';
import TimedRestartSection from './timed-restart-section';

const AdditionalSettings = () => {
  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Additional Settings"
    >
      <TimedRestartSection />
    </Layout>
  );
};

export default AdditionalSettings;
