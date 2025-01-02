import { Pager, RenderTabBarFnProps } from '@/components/Pager';
import { UserAllTimeline, UserTimeline } from '@/components/TimelineList';
import TopTabBar from '@/components/TopTabBar';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTopTabBar } from '@/lib/contexts/TopTabBarContext';
import { useCallback } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TIMELINE_TABS = [
  {
    key: 'userNote',
    label: '帖子',
    component: UserTimeline,
  },
  {
    key: 'all',
    label: '全部',
    component: UserAllTimeline,
  },
] as const;

export default function Profile() {
  const { top } = useSafeAreaInsets();
  const userInfo = useAuth().user;
  const { showTabBar, currentIndex } = useTopTabBar();
  console.log(userInfo);

  const renderTabBar = useCallback(
    (props: RenderTabBarFnProps) => (
      <TopTabBar
        headerTitle="时间线"
        hiddenHeader={false}
        tabBarBackground={TabBarBackground}
        selectedIndex={props.selectedPage}
        onSelectTab={props.onSelect}
        dragProgress={props.dragProgress}
        dragState={props.dragState}
        tabs={TIMELINE_TABS.map(({ key, label }) => ({ key, label }))}
      />
    ),
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View className="flex flex-col items-left" style={styles.userInfoContainer}>
        <Image source={{ uri: userInfo.bannerUrl }} style={styles.banner} />
        <View className={'ml-5'}>
          <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatar} />
          <Text style={styles.username}>{userInfo.username}</Text>
          <Text style={styles.bio}>{userInfo.description ?? 'description'}</Text>
        </View>
      </View>
      <View style={styles.timeLineContainer} className="border-t">
        <Pager
          renderTabBar={renderTabBar}
          onPageScrollStateChanged={(state) => {
            if (state === 'dragging') {
              showTabBar();
            }
          }}
        >
          {TIMELINE_TABS.map(({ key, component: TimelineComponent }, index) => (
            <View key={key} className="flex-1">
              <TimelineComponent isFocused={currentIndex === index} />
            </View>
          ))}
        </Pager>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  banner: {
    width: '100%',
    height: 100,
    marginBottom: -50,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: 'white',
    borderColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: '#666',
  },
  userInfoContainer: {
    zIndex: 9999,
    backgroundColor: 'white',
    marginBottom: -90,
  },
  timeLineContainer: {
    width: '100%',
    height: '88%',
    marginTop: 10,
    borderColor: 'gray',
  },
  timeLine: {},
});
