import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { download } from 'react-native-downloader';

export default function App() {
  const [progress, setProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<string>('');

  const startDownload = async () => {
    setDownloading(true);
    setProgress(0);
    setResult('');

    // Sample 5MB PDF file for testing
    const SAMPLE_URL =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const res = await download({
      url: SAMPLE_URL,
      onProgress: (p) => setProgress(p),
    });

    setDownloading(false);

    if (res.success) {
      setResult(`Success! Saved at: ${res.filePath}`);
    } else {
      setResult(`Error: ${res.error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚀 react-native-downloader</Text>
        <Text style={styles.subtitle}>
          Test pure native downloads instantly.
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, downloading && styles.buttonDisabled]}
          onPress={startDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Download Sample PDF</Text>
          )}
        </TouchableOpacity>

        {result !== '' && <Text style={styles.resultText}>{result}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#38BDF8',
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  button: {
    backgroundColor: '#38BDF8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#0EA5E9',
    opacity: 0.7,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  resultText: {
    marginTop: 24,
    color: '#10B981',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
