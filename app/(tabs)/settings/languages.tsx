import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react-native';
import apiClient from '../../../src/api/apiClient';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useLanguageStore, AdminLanguage } from '../../../src/store/useLanguageStore';

export default function LanguageManagerScreen() {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const { languages, refresh } = useLanguageStore();
  const [selected, setSelected] = useState<AdminLanguage | null>(null);
  const [mode, setMode] = useState<'language'|'translation'|null>(null);
  const [form, setForm] = useState({ code:'', name:'', nativeName:'', isDefault:false, isActive:true });
  const [translation, setTranslation] = useState({ key:'', value:'' });
  const [saving, setSaving] = useState(false);

  const sortedLanguages = useMemo(() => [...languages].sort((a,b)=>Number(b.isDefault)-Number(a.isDefault) || a.code.localeCompare(b.code)), [languages]);

  const openCreate = () => { setSelected(null); setForm({code:'',name:'',nativeName:'',isDefault:false,isActive:true}); setMode('language'); };
  const openEdit = (item: AdminLanguage) => { setSelected(item); setForm({code:item.code,name:item.name,nativeName:item.nativeName,isDefault:item.isDefault,isActive:item.isActive}); setMode('language'); };
  const saveLanguage = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.nativeName.trim()) { Alert.alert(t('common.error'), t('language.language_code')); return; }
    setSaving(true);
    try {
      if (selected) await apiClient.patch(`/admin/languages/${selected._id}`, form);
      else await apiClient.post('/admin/languages', { ...form, translations:{} });
      await refresh(); setMode(null); setSelected(null);
    } catch(e:any) { Alert.alert(t('common.error'), e.response?.data?.message || t('language.save_failed','Unable to save language')); }
    finally { setSaving(false); }
  };
  const deleteLanguage = (item: AdminLanguage) => Alert.alert(t('common.delete'), t('language.delete_confirm'), [
    { text:t('common.cancel'), style:'cancel' },
    { text:t('common.delete'), style:'destructive', onPress:async()=>{ try{ await apiClient.delete(`/admin/languages/${item._id}`); await refresh(); } catch(e:any){ Alert.alert(t('common.error'),e.response?.data?.message||t('common.error')); } } }
  ]);
  const saveTranslation = async () => {
    if (!selected || !translation.key.trim()) return;
    setSaving(true);
    try { await apiClient.put(`/admin/languages/${selected._id}/translations/${encodeURIComponent(translation.key.trim())}`, { key:translation.key.trim(), value:translation.value }); await refresh(); const latest=useLanguageStore.getState().languages.find(x=>x._id===selected._id)||null; setSelected(latest); setTranslation({key:'',value:''}); setMode(null); }
    catch(e:any){ Alert.alert(t('common.error'),e.response?.data?.message||t('language.save_failed','Unable to save translation')); }
    finally{setSaving(false);}
  };
  const deleteTranslation = (key:string) => selected && Alert.alert(t('common.delete'), `${t('language.delete_confirm')}\n${key}`, [
    {text:t('common.cancel'),style:'cancel'},
    {text:t('common.delete'),style:'destructive',onPress:async()=>{try{await apiClient.delete(`/admin/languages/${selected._id}/translations/${encodeURIComponent(key)}`);await refresh();setSelected(useLanguageStore.getState().languages.find(x=>x._id===selected._id)||null);}catch(e:any){Alert.alert(t('common.error'),e.response?.data?.message||t('common.error'));}}}
  ]);

  return <View style={[styles.container,{backgroundColor:colors.background}]}> 
    <View style={styles.header}><View><Text style={[styles.title,{color:colors.text}]}>{t('language.title')}</Text><Text style={[styles.subtitle,{color:colors.textSecondary}]}>{t('language.subtitle')}</Text></View><TouchableOpacity style={[styles.add,{backgroundColor:colors.primaryAccent}]} onPress={openCreate}><Plus size={18} color="#fff"/><Text style={styles.addText}>{t('language.add_language')}</Text></TouchableOpacity></View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:40}}>
      {sortedLanguages.map((item)=><View key={item._id} style={[styles.card,{backgroundColor:colors.surface,borderColor:colors.border}]}> 
        <View style={styles.row}><View style={{flex:1}}><Text style={[styles.name,{color:colors.text}]}>{item.nativeName} · {item.code.toUpperCase()}</Text><Text style={[styles.meta,{color:colors.textMuted}]}>{item.name} · {Object.keys(item.translations||{}).length} {t('language.translations').toLowerCase()}</Text></View><View style={styles.actions}><TouchableOpacity onPress={()=>openEdit(item)}><Edit3 size={18} color={colors.primaryAccent}/></TouchableOpacity>{!item.isDefault&&<TouchableOpacity onPress={()=>deleteLanguage(item)}><Trash2 size={18} color={colors.danger}/></TouchableOpacity>}</View></View>
        {item.isDefault&&<Text style={[styles.defaultTag,{color:colors.primaryAccent}]}>{t('language.default')}</Text>}
        {Object.entries(item.translations||{}).slice(0,8).map(([key,value])=><View key={key} style={[styles.translationRow,{borderTopColor:colors.border}]}><View style={{flex:1}}><Text style={[styles.key,{color:colors.text}]}>{key}</Text><Text style={[styles.value,{color:colors.textSecondary}]} numberOfLines={2}>{value}</Text></View><TouchableOpacity onPress={()=>{setSelected(item);setTranslation({key,value});setMode('translation')}}><Edit3 size={16} color={colors.textMuted}/></TouchableOpacity><TouchableOpacity onPress={()=>deleteTranslation(key)}><Trash2 size={16} color={colors.danger}/></TouchableOpacity></View>)}
        <TouchableOpacity style={[styles.addTranslation,{borderColor:colors.border}]} onPress={()=>{setSelected(item);setTranslation({key:'',value:''});setMode('translation')}}><Plus size={16} color={colors.primaryAccent}/><Text style={[styles.addTranslationText,{color:colors.primaryAccent}]}>{t('language.add_translation')}</Text></TouchableOpacity>
      </View>)}
    </ScrollView>
    {mode&&<View style={styles.overlay}><View style={[styles.modal,{backgroundColor:colors.surface}]}> 
      <View style={styles.modalHeader}><Text style={[styles.modalTitle,{color:colors.text}]}>{mode==='language'?(selected?t('language.edit_language'):t('language.create_language')):(translation.key?t('language.edit_translation'):t('language.add_translation'))}</Text><TouchableOpacity onPress={()=>setMode(null)}><X size={22} color={colors.textMuted}/></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {mode==='language'?<>
        {([['code','language.language_code'],['name','language.language_name'],['nativeName','language.native_name']] as const).map(([field,label])=><View key={field} style={styles.field}><Text style={[styles.label,{color:colors.textSecondary}]}>{t(label)}</Text><TextInput editable={field==='code'&&!selected} value={(form as any)[field]} onChangeText={(v)=>setForm({...form,[field]:v})} placeholder={t(label)} placeholderTextColor={colors.textMuted} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/></View>)}
      </>:<>
        <View style={styles.field}><Text style={[styles.label,{color:colors.textSecondary}]}>{t('language.translation_key')}</Text><TextInput editable={!Boolean(selected&&translation.key&&selected.translations?.[translation.key])} value={translation.key} onChangeText={(v)=>setTranslation({...translation,key:v})} placeholder="home.book_now" placeholderTextColor={colors.textMuted} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/></View>
        <View style={styles.field}><Text style={[styles.label,{color:colors.textSecondary}]}>{t('language.translation_value')}</Text><TextInput multiline value={translation.value} onChangeText={(v)=>setTranslation({...translation,value:v})} placeholder="Book Now" placeholderTextColor={colors.textMuted} style={[styles.input,{height:100,color:colors.text,borderColor:colors.border,backgroundColor:colors.background,textAlignVertical:'top'}]}/></View>
      </>}
      </ScrollView>
      <TouchableOpacity disabled={saving} onPress={mode==='language'?saveLanguage:saveTranslation} style={[styles.save,{backgroundColor:colors.primaryAccent}]}><Save size={18} color="#fff"/><Text style={styles.saveText}>{saving?t('common.loading'):t('common.save')}</Text></TouchableOpacity>
    </View></View>}
  </View>;
}
const styles=StyleSheet.create({container:{flex:1},header:{padding:16,paddingTop:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},title:{fontSize:22,fontWeight:'800'},subtitle:{fontSize:12,marginTop:4,maxWidth:220},add:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,paddingVertical:10,borderRadius:10},addText:{color:'#fff',fontWeight:'700',fontSize:12},card:{borderWidth:1,borderRadius:16,padding:14,marginBottom:14},row:{flexDirection:'row',alignItems:'center'},name:{fontSize:16,fontWeight:'800'},meta:{fontSize:12,marginTop:3},actions:{flexDirection:'row',gap:16},defaultTag:{fontSize:11,fontWeight:'800',marginTop:8,textTransform:'uppercase'},translationRow:{borderTopWidth:1,marginTop:10,paddingTop:10,flexDirection:'row',alignItems:'center',gap:8},key:{fontSize:12,fontWeight:'700'},value:{fontSize:12,marginTop:2},addTranslation:{marginTop:12,borderWidth:1,borderRadius:10,borderStyle:'dashed',padding:10,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:6},addTranslationText:{fontWeight:'700',fontSize:12},overlay:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},modal:{borderTopLeftRadius:22,borderTopRightRadius:22,padding:18,maxHeight:'82%'},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},modalTitle:{fontSize:18,fontWeight:'800'},field:{marginBottom:14},label:{fontSize:12,fontWeight:'700',marginBottom:6},input:{borderWidth:1,borderRadius:10,paddingHorizontal:12,paddingVertical:11,fontSize:14},save:{marginTop:8,borderRadius:12,paddingVertical:13,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:7},saveText:{color:'#fff',fontWeight:'800'}});
