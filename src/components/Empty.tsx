import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { RootStackProps } from '../types';
import styled from 'styled-components/native';

import Button from './Button';

const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const InfosText = styled.Text`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  margin: 15px 0;
`;

const Image = styled.Image`
  width: 150px;
  height: 150px;
  margin-top: 50px;
`;

interface Props {
  actionTitle?: string;
  hideAction?: boolean;
}

const Empty = ({ actionTitle = 'Create your first artwork!', hideAction = false }: Props): JSX.Element => {
  const navigation = useNavigation<RootStackProps>();
  return (
    <Wrapper>
      <Image source={require('../../assets/images/cactus.png')} />
      <InfosText>There is nothing to show here yet!</InfosText>
      {!hideAction && <Button onPress={() => navigation.navigate('EditorModal')} fill={false} title={actionTitle} />}
    </Wrapper>
  );
};

export default Empty;
