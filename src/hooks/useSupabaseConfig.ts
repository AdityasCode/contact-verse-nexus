
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UiText {
  key: string;
  value: string;
}

interface Setting {
  key: string;
  value: string;
}

interface ValidationRule {
  field_name: string;
  rule_type: string;
  rule_value: string | null;
  error_message: string;
}

export const useSupabaseConfig = () => {
  const [uiTexts, setUiTexts] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [textsResult, settingsResult, rulesResult] = await Promise.all([
          supabase.from('ui_texts').select('key, value'),
          supabase.from('settings').select('key, value'),
          supabase.from('validation_rules').select('*')
        ]);

        if (textsResult.data) {
          const textsMap = textsResult.data.reduce((acc: Record<string, string>, item: UiText) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setUiTexts(textsMap);
        }

        if (settingsResult.data) {
          const settingsMap = settingsResult.data.reduce((acc: Record<string, string>, item: Setting) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setSettings(settingsMap);
        }

        if (rulesResult.data) {
          setValidationRules(rulesResult.data);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getText = (key: string, fallback: string = '') => uiTexts[key] || fallback;
  const getSetting = (key: string, fallback: string = '') => settings[key] || fallback;

  return {
    uiTexts,
    settings,
    validationRules,
    loading,
    getText,
    getSetting
  };
};
