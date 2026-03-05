import { followRepository } from '../repositories/follow.repository';
import { userRepository } from '../repositories/user.repository';

export class FollowService {
  // Follow user
  async followUser(followerId: string, followingUsername: string) {
    // Find user to follow
    const userToFollow = await userRepository.findByUsername(followingUsername);
    if (!userToFollow) {
      throw new Error('User not found');
    }

    if (followerId === userToFollow.id) {
      throw new Error('You cannot follow yourself');
    }

    // Create follow
    const follow = await followRepository.create({
      follower_id: followerId,
      following_id: userToFollow.id
    });

    return {
      following: {
        id: userToFollow.id,
        username: userToFollow.username
      }
    };
  }

  // Unfollow user
  async unfollowUser(followerId: string, followingUsername: string) {
    // Find user to unfollow
    const userToUnfollow = await userRepository.findByUsername(followingUsername);
    if (!userToUnfollow) {
      throw new Error('User not found');
    }

    const unfollowed = await followRepository.delete(followerId, userToUnfollow.id);
    if (!unfollowed) {
      throw new Error('You are not following this user');
    }

    return true;
  }

  // Get followers of a user
  async getFollowers(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const followerIds = await followRepository.getFollowers(user.id);
    
    // Get user details for each follower
    const followers = await Promise.all(
      followerIds.map(id => userRepository.getPublicProfile(id))
    );

    return followers.filter(Boolean);
  }

  // Get users followed by a user
  async getFollowing(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const followingIds = await followRepository.getFollowing(user.id);
    
    // Get user details for each following
    const following = await Promise.all(
      followingIds.map(id => userRepository.getPublicProfile(id))
    );

    return following.filter(Boolean);
  }

  // Check if following
  async isFollowing(followerId: string, followingUsername: string) {
    const user = await userRepository.findByUsername(followingUsername);
    if (!user) {
      throw new Error('User not found');
    }

    return followRepository.isFollowing(followerId, user.id);
  }
}

export const followService = new FollowService();