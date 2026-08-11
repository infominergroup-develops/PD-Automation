const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The sed command changed openStandardPDReportPrintWindow({ to try { openStandardPDReportPrintWindow({
// Let's find that block and close it.

const startText = `try { openStandardPDReportPrintWindow({`;
if(content.includes(startText)) {
  const endTarget = `        gps: { lat: p.gpsLat || 0, lng: p.gpsLng || 0 }
      })),
    });
  };`;
  
  const endRep = `        gps: { lat: p.gpsLat || 0, lng: p.gpsLng || 0 }
      })),
    });
    } catch(err: any) {
       console.error("PRINT ERROR: ", err);
       alert("Error generating report: " + err.message);
    }
  };`;

  if(content.includes(endTarget)) {
     content = content.replace(endTarget, endRep);
     fs.writeFileSync(filePath, content);
     console.log("Try-catch injected.");
  } else {
     console.log("Could not find endTarget.");
  }
}

