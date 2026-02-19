import nodemailer from 'nodemailer';
import { config } from '../src/config';
import dns from 'dns';
import util from 'util';

const resolveTxt = util.promisify(dns.resolveTxt);

const verifyConnection = async (): Promise<boolean> => {
    try {
        const transport = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465,
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
        await transport.verify();
        console.log('✅ SMTP Connection Verified');
        return true;
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error);
        return false;
    }
};

const SPAM_TRIGGER_WORDS = [
    'free', 'guarantee', 'spam', 'credit', 'risk-free', 'buy now', 'winner',
    'urgent', 'act now', 'click here', 'exclusive deal', 'amazing'
];

async function checkDNS(domain: string) {
    console.log(`\n🔍 Checking DNS records for domain: ${domain}...`);

    try {
        const records = await resolveTxt(domain);
        // SPF check
        const spfRecord = records.flat().find(r => r.includes('v=spf1'));
        if (spfRecord) {
            console.log(`✅ SPF Record found: ${spfRecord}`);
        } else {
            console.warn('❌ SPF Record missing! Emails may be marked as spam.');
        }

        // DMARC check (simplified, usually at _dmarc.domain)
        try {
            const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
            const dmarcRecord = dmarcRecords.flat().find(rec => rec.includes('v=DMARC1'));
            if (dmarcRecord) {
                console.log(`✅ DMARC Record found: ${dmarcRecord}`);
            } else {
                console.warn('❌ DMARC Record missing! Highly recommended for deliverability.');
            }
        } catch (e) {
            console.warn('❌ DMARC Record missing or unresolvable.');
        }

    } catch (error) {
        console.error(`❌ DNS Lookup failed for ${domain}: ${(error as Error).message}`);
    }
}

async function checkSpamTriggers(subject: string, body: string) {
    console.log('\n🔍 Scanning content for spam triggers...');
    const content = (subject + ' ' + body).toLowerCase();
    const foundTriggers = SPAM_TRIGGER_WORDS.filter(word => content.includes(word));

    if (foundTriggers.length > 0) {
        console.warn(`⚠️  Potential Spam Triggers Found: ${foundTriggers.join(', ')}`);
        console.warn('   Consider rephrasing to improve deliverability.');
    } else {
        console.log('✅ No common spam trigger words found.');
    }
}

async function runAudit() {
    console.log('=============================================');
    console.log('      Email Deliverability Audit Tool        ');
    console.log('=============================================');

    // 1. SMTP Connection Check
    console.log('\nSTEP 1: Testing SMTP Connection...');
    const isConnected = await verifyConnection();

    if (!isConnected) {
        console.error('❌ SMTP Connection failed. Please check your credentials in .env');
        // proceed anyway to show other checks? No, connection is critical.
        // Actually, let's proceed to show DNS checks if possible.
    }

    // 2. Domain & DNS Check
    const fromAddress = config.email.user || 'test@example.com'; // Fallback for checking logic
    const domainMatch = fromAddress.match(/@([\w.-]+)/);

    if (domainMatch && domainMatch[1]) {
        const domain = domainMatch[1];
        if (domain === 'ethereal.email' || domain === 'example.com') {
            console.warn(`\n⚠️  Using test/default domain (${domain}). DNS checks skipped/irrelevant.`);
        } else {
            await checkDNS(domain);
        }
    } else {
        console.error('❌ Could not extract domain from sender address for DNS checks.');
    }

    // 3. Content Analysis (Sample)
    console.log('\nSTEP 3: Analyzing Content (Sample)...');
    const sampleSubject = "Win a free iPhone now!";
    const sampleBody = "Click here to claim your prize. This is risk-free.";
    await checkSpamTriggers(sampleSubject, sampleBody);

    console.log('\n=============================================');
    console.log('      Audit Complete                         ');
    console.log('=============================================');
}

runAudit().catch(err => console.error(err));
