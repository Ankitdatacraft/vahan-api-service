(async function(){
    if(!window.location.href.includes("vahan4dashboard")){
        console.error("Bhai, pehle Vahan Dashboard wala page kholiye!"); return;
    }

    // --- 🗄️ DATABASE: ALL STATES RTO MAPPING ---
    const allStatesData = {
        "UP": {"name": "Uttar Pradesh", "mapping": {"80":"Agra","45":"Akbarpur","81":"Aligarh","36":"Amethi","79":"Auraiya","42":"Ayodhya","50":"Azamgarh","24":"Badaun","17":"Baghpat","40":"Bahraich","60":"Ballia","47":"Balrampur","90":"Banda","41":"Barabanki","25":"Bareilly","51":"Basti","66":"Bhadohi","20":"Bijnor","13":"Bulandshahr","67":"Chandauli","96":"Chitrakoot","52":"DEORIA","82":"Etah","75":"Etawah","76":"Farrukhabad","71":"FATHEHPUR","83":"FEROZABAD","14":"GHAZIABAD","61":"Ghazipur","43":"GONDA","53":"Gorakhpur","91":"HAMIRPUR(UP)","37":"Hapur","30":"HARDOI","86":"HATHRAS","62":"JAUNPUR","93":"JhansiRTO","23":"JPNAGAR","74":"Kannauj","77":"Kanpur Dehat","78":"KANPUR NAGAR","87":"Kasganj","73":"Kaushambi","31":"LAKHIMPUR Kheri","94":"Lalitpur","321":"MAHANAGAR ARTO LUCKNOW (UP321)","56":"Maharajganj","95":"Mahoba","84":"Mainpuri","85":"MATHURA","54":"Mau","15":"MEERUT RTO","63":"MIRZAPUR RTO","21":"MORADABAD","12":"MuzaffarNagar","16":"Noida","92":"Orai","57":"PADRAUNA(KUSHI NAGAR)","26":"Pilibhit","72":"PRATAPGARH","70":"Prayagraj RTO","33":"Raibareilly","22":"ARTO OFFICE RAMPUR","11":"SAHARANPUR RTO","27":"SAHJAHANPUR","38":"Sambhal ARTO","58":"Sant Kabir Nagar","19":"SHAMLI ARTO","55":"Siddharth Nagar(naugarh)","34":"Sitapur","64":"SONBHADRA","44":"Sultanpur","32":"TRANSPORT NAGAR RTO LUCKNOW (UP32)","35":"Unnao","65":"VARANASI RTO"}},
        "HR": {"name": "Haryana", "mapping": {"29":"BALLABGARH","81":"Bawal","51":"FARIDABAD","72":"GURUGRAM SOUTH","52":"HATHIN","50":"Hodel","82":"KANINA","43":"KOSLI","34":"MAHENDERGARH","35":"NARNAUL","27":"NUH","30":"PALWAL","76":"PATAUDI","36":"REWARI","96":"RLA TAURU","38":"RTA, FARIDABAD","55":"RTA, GURGAON","66":"RTA, MOHINDERGARH","47":"RTA, REWARI","87":"SDM BADKHAL","98":"SDM BADSHAHPUR","26":"SDM GURUGRAM","93":"SDM PUNHANA"}},
        "UK": {"name": "Uttarakhand", "mapping": {"1":"ALMORA RTO","2":"BAGESHWAR ARTO","7":"DEHRADUN RTO","4":"HALDWANI RTO","8":"HARIDWAR ARTO","11":"KARANPRAYAG ARTO","18":"KASHIPUR ARTO","15":"KOTDWAR ARTO","12":"PAURI RTO","5":"PITHORAGARH ARTO","19":"RAMNAGAR ARTO","20":"RANIKHET ARTO","14":"RISHIKESH ARTO","17":"ROORKEE ARTO","13":"RUDRAPRAYAG ARTO","3":"TANAKPUR ARTO","9":"TEHRI ARTO","6":"UDHAM SINGH NAGAR ARTO","10":"UTTARKASHI ARTO","16":"VIKAS NAGAR ARTO"}},
        "DL": {"name": "Delhi", "mapping": {"-1": "All Vahan4 Running Office"}}
    };

    // --- 🖥️ UI CONTROL PANEL ---
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="botPanel" style="position:fixed;top:10%;left:30%;width:400px;background:white;border:3px solid #2c3e50;padding:20px;z-index:10000;box-shadow:0 0 20px rgba(0,0,0,0.5);border-radius:10px;font-family:sans-serif;">
            <h3 style="margin-top:0;color:#c0392b;text-align:center;">🚀 North India Master Bot</h3>
            <p style="font-size:12px;text-align:center;">Select States to Fetch (Data Aligned)</p>
            <div style="margin:15px 0;">
                <label><input type="checkbox" class="state-chk" value="UP"> Uttar Pradesh (77 RTOs)</label><br>
                <label><input type="checkbox" class="state-chk" value="HR"> Haryana (23 RTOs)</label><br>
                <label><input type="checkbox" class="state-chk" value="UK"> Uttarakhand (20 RTOs)</label><br>
                <label><input type="checkbox" class="state-chk" value="DL"> Delhi (One-Click All)</label>
            </div>
            <button id="startBot" style="width:100%;padding:10px;background:#27ae60;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">START FETCHING</button>
            <button id="closePanel" style="width:100%;margin-top:5px;background:transparent;border:none;color:grey;cursor:pointer;font-size:11px;">Cancel</button>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('closePanel').onclick = () => panel.remove();
    document.getElementById('startBot').onclick = async () => {
        const selected = Array.from(document.querySelectorAll('.state-chk:checked')).map(c => c.value);
        if(selected.length === 0) return alert("Bhai, kam se kam ek state toh select karo!");
        panel.remove();
        await mainExecution(selected);
    };

    async function mainExecution(selectedStates) {
        for (let stateCode of selectedStates) {
            await processState(stateCode);
        }
        console.log("%c 🏆 MISSION ACCOMPLISHED: All Selected States Processed!", "color:white;background:#27ae60;padding:10px;font-weight:bold;");
    }

    async function processState(stateCode) {
        const stateInfo = allStatesData[stateCode];
        const rtoMapping = stateInfo.mapping;
        const rtoCodes = Object.keys(rtoMapping);
        const monthOrder = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        
        console.log(`%c 🟩 STARTING STATE: ${stateInfo.name} 🟩`, "color:white;background:#2980b9;padding:8px;font-weight:bold;");

        let csvRows = []; let cleanMonths = []; let parser = new DOMParser();

        for (let i = 0; i < rtoCodes.length; i++) {
            let code = rtoCodes[i]; let city = rtoMapping[code];
            
            // --- 🔎 DYNAMIC SCANNER (Har Loop mein Fresh IDs) ---
            const sideBtn = document.querySelector('button[onclick*="combTablePnl"]:not([onclick*="VhCatg"])');
            const stateSel = document.querySelector('select[onchange*="selectedRto"]');
            const vsElem = document.querySelector('input[name*="javax.faces.ViewState"]');

            if (!sideBtn || !stateSel || !vsElem) {
                console.error("❌ Scanner Fail! Portal structure changed."); break;
            }

            console.log(`%c 🛰️ [${stateCode}] Processing: ${city} (${i+1}/${rtoCodes.length})`, "color:#34495e;");

            try {
                // STEP 1: Select State & City
                let s1 = new URLSearchParams();
                s1.append("javax.faces.partial.ajax", "true");
                s1.append("javax.faces.source", stateSel.id.replace("_input",""));
                s1.append("javax.faces.partial.execute", stateSel.id.replace("_input",""));
                s1.append("javax.faces.partial.render", "yaxisVar");
                s1.append("javax.faces.behavior.event", "change");
                s1.append("masterLayout_formlogin", "masterLayout_formlogin");
                s1.append(stateSel.id, stateCode);
                s1.append("selectedRto_input", code);
                s1.append("javax.faces.ViewState", vsElem.value);

                let res1 = await fetch(window.location.href, { method: "POST", body: s1 });
                let vs1 = parser.parseFromString(await res1.text(), "text/xml").querySelector("update[id*='ViewState']")?.textContent;
                if(vs1) vsElem.value = vs1;

                await new Promise(r => setTimeout(r, 1500));

                // STEP 2: Refresh with Filters
                let s2 = new URLSearchParams();
                s2.append("javax.faces.partial.ajax", "true");
                s2.append("javax.faces.source", sideBtn.id);
                s2.append("javax.faces.partial.execute", "@all");
                s2.append("javax.faces.partial.render", "combTablePnl");
                s2.append(sideBtn.id, sideBtn.id);
                s2.append("masterLayout_formlogin", "masterLayout_formlogin");
                s2.append("j_idt30_input", "A"); 
                s2.append(stateSel.id, stateCode);
                s2.append("selectedRto_input", code);
                s2.append("yaxisVar_input", "Maker");
                s2.append("xaxisVar_input", "Month Wise");
                s2.append("selectedYear_input", "2026");
                s2.append("VhCatg", "LMV"); s2.append("VhCatg", "LPV");
                s2.append("norms", "99"); s2.append("fuel", "4"); s2.append("fuel", "23");
                s2.append("VhClass", "7");
                s2.append("javax.faces.ViewState", vsElem.value);

                let res2 = await fetch(window.location.href, { method: "POST", body: s2 });
                let xmlDoc = parser.parseFromString(await res2.text(), "text/xml");
                let vs2 = xmlDoc.querySelector("update[id*='ViewState']")?.textContent;
                if(vs2) vsElem.value = vs2;

                let tableData = xmlDoc.querySelector("update[id='combTablePnl']")?.textContent;
                if(tableData && !tableData.includes("No Record Found")) {
                    let div = document.createElement("div"); div.innerHTML = tableData;
                    
                    let headerMap = {};
                    div.querySelectorAll("thead th").forEach(th => {
                        let name = th.innerText.trim().toUpperCase();
                        let id = th.id || "";
                        let mMatch = id.match(/:j_idt(\d+):(\d+)$/);
                        if (mMatch && name !== "TOTAL") headerMap[name] = { group: mMatch[1], idx: mMatch[2] };
                    });

                    if(cleanMonths.length === 0) {
                        cleanMonths = monthOrder.filter(m => headerMap[m] !== undefined);
                    }

                    let makersInCity = 0;
                    div.querySelectorAll("tbody tr").forEach(row => {
                        let mkName = row.querySelector('td:nth-child(2)')?.innerText.trim();
                        if(mkName && !mkName.includes("Maker") && mkName !== "TOTAL") {
                            makersInCity++;
                            let rowData = [stateInfo.name, city, `${stateCode}${code}`, `"${mkName}"`];
                            cleanMonths.forEach(mName => {
                                let mInfo = headerMap[mName];
                                let mLabel = row.querySelector(`label[id*="j_idt${parseInt(mInfo.group)+5}:${mInfo.idx}:j_idt"]`);
                                rowData.push(mLabel ? mLabel.innerText.trim() : "0");
                            });
                            csvRows.push(rowData.join(","));
                        }
                    });
                    console.log(`%c 📊 ${city}: ${makersInCity} Makers | Total Rows: ${csvRows.length}`, "color:#27ae60;");
                }
            } catch (err) { console.error(`Error in ${city}:`, err); }
            await new Promise(r => setTimeout(r, 1200));
        }

        // --- 💾 DOWNLOAD STATE CSV ---
        if(csvRows.length > 0) {
            let today = new Date();
            let dStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
            let finalCSV = ["State,City,Code,Maker", ...cleanMonths].join(",") + "\n" + csvRows.join("\n");
            let blob = new Blob([finalCSV], {type:'text/csv'});
            let link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Vahan_${stateCode}_Report_${dStr}.csv`;
            link.click();
            console.log(`%c 💾 ${stateInfo.name} File Downloaded!`, "color:white;background:#e67e22;padding:5px;");
        }
    }
})();
