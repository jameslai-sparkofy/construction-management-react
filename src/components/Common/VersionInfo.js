import React from 'react';
import './VersionInfo.css';

function VersionInfo() {
  // 這些值會在構建時被環境變量替換
  const commitHash = process.env.REACT_APP_COMMIT_HASH || 'dev';
  const buildTime = process.env.REACT_APP_BUILD_TIME || new Date().toISOString();
  
  const formatBuildTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Taipei'
      });
    } catch (e) {
      return isoString;
    }
  };

  const shortHash = commitHash.substring(0, 7);

  return (
    <div className="version-info">
      <div className="version-item">
        <span className="version-label">🔧</span>
        <span className="version-value">
          <a 
            href={`https://github.com/jameslai-sparkofy/construction-management-react/commit/${commitHash}`}
            target="_blank"
            rel="noopener noreferrer"
            title="查看此版本的 GitHub commit"
          >
            {shortHash}
          </a>
        </span>
      </div>
      <div className="version-item">
        <span className="version-label">📅</span>
        <span className="version-value" title="部署時間">
          {formatBuildTime(buildTime)}
        </span>
      </div>
    </div>
  );
}

export default VersionInfo;