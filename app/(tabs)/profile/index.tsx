import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { router } from 'expo-router';
import { User, Globe, Moon, Sun, Monitor, LogOut, LogIn, Edit3, Save, X } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useUserAuthStore } from '../../../src/store/useUserAuthStore';
import { useLanguageStore } from '../../../src/store/useLanguageStore';
import userApiClient from '../../../src/api/userApiClient';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'ta', name: 'Tamil (தமிழ்)' }, { code: 'ml', name: 'Malayalam (മലയാളം)' }, { code: 'hi', name: 'Hindi (हिन्दी)' }, { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const { colors, mode, setThemeMode } = useThemeStore();
  const { user, isGuest, logout, setUser } = useUserAuthStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', profileImage: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm({ name: user?.name || '', phone: user?.phone || '', profileImage: user?.profileImage || '' }), [user]);

  const saveProfile = async () => {
    if (!form.name.trim()) { Alert.alert(t('common.error'), 'Name is required.'); return; }
    setSaving(true);
    try {
      const res = await userApiClient.patch('/users/profile', { name: form.name.trim(), phone: form.phone, profileImage: form.profileImage.trim() });
      if (res.data?.data) {
        const updated = res.data.data;
        await setUser({ id: String(updated.id || updated._id), name: updated.name, email: updated.email, phone: updated.phone || '', profileImage: updated.profileImage || '', preferredLanguage: updated.preferredLanguage, themePreference: updated.themePreference });
      }
      setEditOpen(false);
      Alert.alert(t('common.success'), 'Profile updated successfully.');
    } catch (e: any) { Alert.alert(t('common.error'), e.response?.data?.message || 'Unable to update profile.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => Alert.alert(t('profile.sign_out'), t('profile.sign_out_confirm'), [
    { text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(tabs)'); } }
  ]);

  return <ScrollView style={[styles.container,{backgroundColor:colors.background}]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.profileCard,{backgroundColor:colors.surface,borderColor:colors.border}]}>
      {user?.profileImage ? <Image source={{uri:user.profileImage}} style={styles.avatarImage}/> : <View style={[styles.avatar,{backgroundColor:colors.surfaceSecondary}]}><User size={36} color={colors.primaryAccent}/></View>}
      <Text style={[styles.userName,{color:colors.text}]}>{isGuest?'Guest User':user?.name}</Text>
      <Text style={[styles.userEmail,{color:colors.textSecondary}]}>{isGuest?'Sign in to sync your bookings across devices':user?.email}</Text>
      {!isGuest && <TouchableOpacity style={[styles.editProfileBtn,{borderColor:colors.border}]} onPress={()=>setEditOpen(true)}><Edit3 size={16} color={colors.primaryAccent}/><Text style={[styles.editProfileText,{color:colors.primaryAccent}]}>Edit Profile</Text></TouchableOpacity>}
    </View>

    <Text style={[styles.sectionTitle,{color:colors.textSecondary}]}>{t('profile.appearance')}</Text>
    <View style={[styles.settingsCard,{backgroundColor:colors.surface,borderColor:colors.border}]}>{(['light','dark','system'] as const).map(tMode=>{const selected=mode===tMode;return <TouchableOpacity key={tMode} style={styles.settingRow} onPress={()=>setThemeMode(tMode)}><View style={styles.rowLeft}>{tMode==='light'?<Sun size={18} color={colors.text}/>:tMode==='dark'?<Moon size={18} color={colors.text}/>:<Monitor size={18} color={colors.text}/>}<Text style={[styles.settingLabel,{color:colors.text}]}>{tMode.charAt(0).toUpperCase()+tMode.slice(1)} Mode</Text></View>{selected&&<View style={[styles.activeDot,{backgroundColor:colors.primaryAccent}]}/>}</TouchableOpacity>})}</View>

    <Text style={[styles.sectionTitle,{color:colors.textSecondary,marginTop:20}]}>{t('Language / மொழி')}</Text>
    <View style={[styles.settingsCard,{backgroundColor:colors.surface,borderColor:colors.border}]}>{LANGUAGES.map(lang=>{const selected=currentLanguage===lang.code;return <TouchableOpacity key={lang.code} style={styles.settingRow} onPress={()=>setLanguage(lang.code)}><View style={styles.rowLeft}><Globe size={18} color={colors.text}/><Text style={[styles.settingLabel,{color:colors.text}]}>{lang.name}</Text></View>{selected&&<View style={[styles.activeDot,{backgroundColor:colors.primaryAccent}]}/>}</TouchableOpacity>})}</View>

    <View style={styles.authActionWrapper}>{isGuest?<TouchableOpacity style={[styles.actionBtn,{backgroundColor:colors.primaryAccent}]} onPress={()=>router.push('/(auth)/login')}><LogIn size={18} color="#FFFFFF"/><Text style={styles.actionBtnText}>{t('profile.sign_in_register')}</Text></TouchableOpacity>:<TouchableOpacity style={[styles.actionBtn,{backgroundColor:colors.danger}]} onPress={handleLogout}><LogOut size={18} color="#FFFFFF"/><Text style={styles.actionBtnText}>{t('profile.sign_out')}</Text></TouchableOpacity>}</View>

    <Modal transparent visible={editOpen} animationType="slide" onRequestClose={()=>setEditOpen(false)}><View style={styles.overlay}><View style={[styles.modal,{backgroundColor:colors.surface}]}><View style={styles.modalHeader}><Text style={[styles.modalTitle,{color:colors.text}]}>Edit Profile</Text><TouchableOpacity onPress={()=>setEditOpen(false)}><X size={22} color={colors.textMuted}/></TouchableOpacity></View><Text style={[styles.label,{color:colors.textSecondary}]}>Name</Text><TextInput value={form.name} onChangeText={v=>setForm({...form,name:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/><Text style={[styles.label,{color:colors.textSecondary}]}>Phone</Text><TextInput value={form.phone} onChangeText={v=>setForm({...form,phone:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/><Text style={[styles.label,{color:colors.textSecondary}]}>Profile Image URL (optional)</Text><TextInput value={form.profileImage} onChangeText={v=>setForm({...form,profileImage:v})} placeholder="https://..." placeholderTextColor={colors.textMuted} autoCapitalize="none" style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/>{form.profileImage?<Image source={{uri:form.profileImage}} style={styles.preview}/>:null}<TouchableOpacity disabled={saving} onPress={saveProfile} style={[styles.saveBtn,{backgroundColor:colors.primaryAccent}]}><Save size={18} color="#fff"/><Text style={styles.saveText}>{saving?'Saving...':'Save Profile'}</Text></TouchableOpacity></View></View></Modal>
  </ScrollView>;
}
const styles=StyleSheet.create({container:{flex:1},content:{padding:16,paddingBottom:40},profileCard:{padding:24,borderRadius:20,borderWidth:1,alignItems:'center',marginBottom:20},avatar:{width:72,height:72,borderRadius:36,alignItems:'center',justifyContent:'center',marginBottom:12},avatarImage:{width:72,height:72,borderRadius:36,marginBottom:12},userName:{fontSize:20,fontWeight:'800'},userEmail:{fontSize:13,marginTop:4,textAlign:'center'},editProfileBtn:{marginTop:14,borderWidth:1,borderRadius:10,paddingHorizontal:12,paddingVertical:8,flexDirection:'row',alignItems:'center',gap:6},editProfileText:{fontSize:12,fontWeight:'800'},sectionTitle:{fontSize:12,fontWeight:'700',textTransform:'uppercase',marginBottom:10,letterSpacing:.5},settingsCard:{borderRadius:16,borderWidth:1,overflow:'hidden'},settingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#F1F5F9'},rowLeft:{flexDirection:'row',alignItems:'center',gap:12},settingLabel:{fontSize:15,fontWeight:'600'},activeDot:{width:10,height:10,borderRadius:5},authActionWrapper:{marginTop:28},actionBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:14},actionBtnText:{color:'#FFFFFF',fontSize:16,fontWeight:'700'},overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.45)'},modal:{borderTopLeftRadius:22,borderTopRightRadius:22,padding:20,paddingBottom:32},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},modalTitle:{fontSize:19,fontWeight:'800'},label:{fontSize:12,fontWeight:'700',marginBottom:7},input:{borderWidth:1,borderRadius:12,paddingHorizontal:12,paddingVertical:12,marginBottom:14},preview:{width:72,height:72,borderRadius:36,marginBottom:14},saveBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:12},saveText:{color:'#fff',fontWeight:'800'}});
