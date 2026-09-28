import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { router } from 'expo-router';
import { User, Users, Globe, Moon, Sun, Smartphone, Lock, LogOut, ChevronRight, Star, Save, X } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAdminAuthStore } from '../../../src/store/useAdminAuthStore';
import apiClient from '../../../src/api/apiClient';

export default function AdminSettingsScreen() {
  const { t } = useTranslation();
  const { colors, mode, setThemeMode } = useThemeStore();
  const { admin, logout, setAdmin, setAuth } = useAdminAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '', profileImage: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setProfile({ name: admin?.name || '', phone: admin?.phone || '', profileImage: admin?.profileImage || '' }); }, [admin]);

  const saveProfile = async () => {
    if (!profile.name.trim()) { Alert.alert(t('Error'), 'Name is required.'); return; }
    setSaving(true);
    try {
      const res = await apiClient.patch('/admin/profile', { name: profile.name.trim(), phone: profile.phone, profileImage: profile.profileImage.trim() });
      const updated = res.data?.data;
      if (updated) setAdmin({ id: String(updated.id || updated._id), name: updated.name, email: updated.email, phone: updated.phone || '', profileImage: updated.profileImage || '', role: updated.role || 'ADMIN' });
      setProfileOpen(false);
      Alert.alert(t('Success'), 'Profile updated successfully.');
    } catch (e: any) { Alert.alert(t('Error'), e.response?.data?.message || 'Unable to update profile.'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!password.currentPassword || password.newPassword.length < 8) { Alert.alert(t('Error'), 'Enter the current password and a new password with at least 8 characters.'); return; }
    setSaving(true);
    try {
      const res = await apiClient.post('/admin/change-password', password);
      const tokens = res.data?.data?.tokens;
      if (tokens && admin) await setAuth(admin, tokens.accessToken, tokens.refreshToken);
      setPassword({ currentPassword: '', newPassword: '' });
      setPasswordOpen(false);
      Alert.alert(t('Success'), 'Password changed successfully.');
    } catch (e: any) { Alert.alert(t('Error'), e.response?.data?.message || 'Unable to change password.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => Alert.alert(t('Log Out'), t('admin.logout_confirm'), [
    { text: t('Cancel'), style: 'cancel' },
    { text: t('Log Out'), style: 'destructive', onPress: async () => { setLoggingOut(true); try { await apiClient.post('/admin/logout'); } catch {} finally { await logout(); router.replace('/(auth)/login'); } } }
  ]);

  const themeOptions: { key: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun size={16} color={mode === 'light' ? '#FFFFFF' : colors.textSecondary} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={16} color={mode === 'dark' ? '#FFFFFF' : colors.textSecondary} /> },
    { key: 'system', label: 'System', icon: <Smartphone size={16} color={mode === 'system' ? '#FFFFFF' : colors.textSecondary} /> },
  ];

  return <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {admin?.profileImage ? <Image source={{ uri: admin.profileImage }} style={styles.avatarImage} /> : <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}><User size={28} color={colors.primaryAccent} /></View>}
      <View style={styles.profileInfo}><Text style={[styles.profileName, { color: colors.text }]}>{admin?.name || 'Administrator'}</Text><Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{admin?.email}</Text></View>
      <TouchableOpacity onPress={() => setProfileOpen(true)}><Text style={[styles.editText, { color: colors.primaryAccent }]}>Edit</Text></TouchableOpacity>
    </View>

    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Appearance')}</Text>
    <View style={[styles.themeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>{themeOptions.map(option => <TouchableOpacity key={option.key} style={[styles.themeOption, mode === option.key && { backgroundColor: colors.primaryAccent }]} onPress={() => setThemeMode(option.key)}>{option.icon}<Text style={[styles.themeOptionText, { color: mode === option.key ? '#fff' : colors.textSecondary }]}>{option.label}</Text></TouchableOpacity>)}</View>

    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Management')}</Text>
    <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/settings/users')}><View style={styles.menuLeft}><Users size={18} color={colors.primaryAccent} /><Text style={[styles.menuText, { color: colors.text }]}>{t('Customer Accounts')}</Text></View><ChevronRight size={18} color={colors.textMuted} /></TouchableOpacity>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/settings/languages')}><View style={styles.menuLeft}><Globe size={18} color={colors.primaryAccent} /><Text style={[styles.menuText, { color: colors.text }]}>{t('language.title')}</Text></View><ChevronRight size={18} color={colors.textMuted} /></TouchableOpacity>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/banners')}><View style={styles.menuLeft}><Star size={18} color={colors.primaryAccent} /><Text style={[styles.menuText, { color: colors.text }]}>{t('Promotional Banners')}</Text></View><ChevronRight size={18} color={colors.textMuted} /></TouchableOpacity>
    </View>

    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Account')}</Text>
    <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.menuRow} onPress={() => setPasswordOpen(true)}><View style={styles.menuLeft}><Lock size={18} color={colors.primaryAccent} /><Text style={[styles.menuText, { color: colors.text }]}>{t('Change Password')}</Text></View><ChevronRight size={18} color={colors.textMuted} /></TouchableOpacity>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <TouchableOpacity style={styles.menuRow} onPress={handleLogout} disabled={loggingOut}><View style={styles.menuLeft}><LogOut size={18} color={colors.danger} /><Text style={[styles.menuText, { color: colors.danger }]}>{loggingOut ? 'Logging out...' : 'Log Out'}</Text></View></TouchableOpacity>
    </View>

    <Text style={[styles.versionText, { color: colors.textMuted }]}>Salon Admin • v1.0.0</Text>

    <Modal transparent visible={profileOpen} animationType="slide" onRequestClose={() => setProfileOpen(false)}><View style={styles.overlay}><View style={[styles.modal, { backgroundColor: colors.surface }]}><View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text><TouchableOpacity onPress={() => setProfileOpen(false)}><X size={22} color={colors.textMuted} /></TouchableOpacity></View><Text style={[styles.label,{color:colors.textSecondary}]}>Name</Text><TextInput value={profile.name} onChangeText={v => setProfile({...profile,name:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]} /><Text style={[styles.label,{color:colors.textSecondary}]}>Phone</Text><TextInput value={profile.phone} onChangeText={v => setProfile({...profile,phone:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]} /><Text style={[styles.label,{color:colors.textSecondary}]}>Profile Image URL (optional)</Text><TextInput value={profile.profileImage} onChangeText={v => setProfile({...profile,profileImage:v})} placeholder="https://..." placeholderTextColor={colors.textMuted} autoCapitalize="none" style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]} />{profile.profileImage ? <Image source={{uri:profile.profileImage}} style={styles.preview} /> : null}<TouchableOpacity disabled={saving} onPress={saveProfile} style={[styles.saveBtn,{backgroundColor:colors.primaryAccent}]}><Save size={18} color="#fff"/><Text style={styles.saveText}>{saving?'Saving...':'Save Profile'}</Text></TouchableOpacity></View></View></Modal>

    <Modal transparent visible={passwordOpen} animationType="slide" onRequestClose={() => setPasswordOpen(false)}><View style={styles.overlay}><View style={[styles.modal,{backgroundColor:colors.surface}]}><View style={styles.modalHeader}><Text style={[styles.modalTitle,{color:colors.text}]}>Change Password</Text><TouchableOpacity onPress={() => setPasswordOpen(false)}><X size={22} color={colors.textMuted}/></TouchableOpacity></View><Text style={[styles.label,{color:colors.textSecondary}]}>Current Password</Text><TextInput secureTextEntry value={password.currentPassword} onChangeText={v=>setPassword({...password,currentPassword:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]}/><Text style={[styles.label,{color:colors.textSecondary}]}>New Password</Text><TextInput secureTextEntry value={password.newPassword} onChangeText={v=>setPassword({...password,newPassword:v})} style={[styles.input,{color:colors.text,borderColor:colors.border,backgroundColor:colors.background}]} /><TouchableOpacity disabled={saving} onPress={changePassword} style={[styles.saveBtn,{backgroundColor:colors.primaryAccent}]}><Save size={18} color="#fff"/><Text style={styles.saveText}>{saving?'Saving...':'Change Password'}</Text></TouchableOpacity></View></View></Modal>
  </ScrollView>;
}
const styles=StyleSheet.create({container:{flex:1},content:{padding:16,paddingBottom:40},profileCard:{flexDirection:'row',alignItems:'center',gap:14,padding:16,borderRadius:16,borderWidth:1,marginBottom:24},avatar:{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center'},avatarImage:{width:56,height:56,borderRadius:28},profileInfo:{flex:1},profileName:{fontSize:17,fontWeight:'700'},profileEmail:{fontSize:13,marginTop:2},editText:{fontSize:13,fontWeight:'800'},sectionLabel:{fontSize:12,fontWeight:'700',textTransform:'uppercase',letterSpacing:.5,marginBottom:10},themeRow:{flexDirection:'row',borderRadius:12,borderWidth:1,padding:4,marginBottom:24,gap:4},themeOption:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:10,borderRadius:8},themeOptionText:{fontSize:12,fontWeight:'600'},menuCard:{borderRadius:14,borderWidth:1,marginBottom:24,overflow:'hidden'},menuRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16},menuLeft:{flexDirection:'row',alignItems:'center',gap:12},menuText:{fontSize:15,fontWeight:'600'},divider:{height:1,marginHorizontal:16},versionText:{textAlign:'center',fontSize:12,marginTop:8},overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.45)'},modal:{borderTopLeftRadius:22,borderTopRightRadius:22,padding:20,paddingBottom:32},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},modalTitle:{fontSize:19,fontWeight:'800'},label:{fontSize:12,fontWeight:'700',marginBottom:7},input:{borderWidth:1,borderRadius:12,paddingHorizontal:12,paddingVertical:12,marginBottom:14},preview:{width:72,height:72,borderRadius:36,marginBottom:14},saveBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:12},saveText:{color:'#fff',fontWeight:'800'}});
