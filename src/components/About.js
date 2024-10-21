import { useState, useEffect } from 'preact/hooks';
import { Button } from 'reactstrap';
import { Storage, StorageSync } from './Utils';

const About = () => {
  const [localBytes, setLocalBytes] = useState({ bytesLocal: 0, bytesMaxLocal: 0 });
  const [syncBytes, setSyncBytes] = useState({ bytesSync: 0, bytesMaxSync: 0 });
  const [btnText, setBtnText] = useState('Clear');

  const handleClearClick = (e) => {
    chrome.storage.local.clear();
    setBtnText('Cleared!');
    setTimeout(() => setBtnText('Clear'), 2000); // Reset button text after 2 seconds
  };

  useEffect(() => {
    const fetchData = async () => {
      const bytesLocal = await Storage.getBytes();
      const bytesSync = await StorageSync.getBytes();
      setLocalBytes({ bytesLocal, bytesMaxLocal: chrome.storage.local.QUOTA_BYTES });
      setSyncBytes({ bytesSync, bytesMaxSync: chrome.storage.sync.QUOTA_BYTES });
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Same structure as before, with slight modernized syntax */}
      <h3>
        <a href="https://github.com/YashSoPro/instameter/blob/master/CHANGELOG.md#changelog" rel="noopener noreferrer" target="_blank">
          Changelog 📃
        </a>
      </h3>
      <h3>About</h3>
      <p>Layoutify: Improved Layout does not collect any data...</p>
      <h3>Donate</h3>
      {/* PayPal button code */}
      <h3>Clear Outdated Data</h3>
      <p>
        <Button color="warning" onClick={handleClearClick}>
          {btnText}
        </Button>
      </p>
      <h3>Thanks to...</h3>
      {/* Credits section */}
      <small><b>Legal...</b></small>
    </div>
  );
};

export default About;
